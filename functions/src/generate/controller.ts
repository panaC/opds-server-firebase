import * as functions from "firebase-functions";
import { basename, extname } from "path";
import {
    PublicationParsePromise,
} from "r2-shared-js/dist/es8-es2017/src/parser/publication-parser";
import { IZip } from "r2-utils-js/dist/es8-es2017/src/_utils/zip/zip.d";
import { streamToBufferPromise } from "r2-utils-js/dist/es8-es2017/src/_utils/stream/BufferUtils";

import { save, deleteFile } from "../storage/service";
import { response } from "../utils/response";
import { promises } from "fs";
import { OPDSPublication } from "r2-opds-js/dist/es8-es2017/src/opds/opds2/opds2-publication";
import { savePublicationInDb, getPublicationInDb, deletePublicationInDb } from "../publication/service";
import { TaJsonSerialize } from "r2-lcp-js/dist/es8-es2017/src/serializable";
import { publicationDb } from "../db/publication";
import { nanoid } from "nanoid";
import { URL } from "url";

const epubTypeLink = "application/epub+zip";

export const generatePublication = async (req: functions.https.Request, res: functions.Response<any>) => {

    const send = response(res);

    const contentType = req.header("content-type") || "";

    if (contentType === epubTypeLink) {

        let filename = req.query["filename"];
        if (typeof filename === "string" && filename) {
    
            filename = nanoid() + "_" + basename(filename);
        } else {
            filename = nanoid() + "_book.epub";
        }
    
        // https://firebase.google.com/docs/functions/http-events#read_values_from_the_request
        const buffer = req.rawBody;
    
        if (Buffer.isBuffer(buffer)) {
            console.log("buffer loaded");
        
            const magic = buffer.readUIntBE(0, 4);
            if (magic === 0x504B0304) {
                console.log("Is a zip file");

                try {
                    
                    const filePath = "/tmp/" + filename;
                    await promises.writeFile(filePath, buffer);
                    
                    const r2Publication = await PublicationParsePromise(filePath);
                    
                    const pubId = r2Publication.Metadata.Identifier = filename;
                    
                    const document = await publicationDb.doc(pubId).get();
                    if (document.exists) {
                        // r2Publication.freeDestroy();
                        send(400, "publication already exists");
                        return;
                    }
                    
                    const publication = new OPDSPublication();

                    publication.Metadata = r2Publication.Metadata;


                    // THORIUM_READER
                    // ==

                    // private Internal is very hacky! :(
                    const zipInternal = (r2Publication as any).Internal.find((i: any) => {
                        if (i.Name === "zip") {
                            return true;
                        }
                        return false;
                    });
                    const zip = zipInternal.Value as IZip;

                    const coverLink = r2Publication.GetCover();
                    if (!coverLink) {
                        // after PublicationParsePromise, cleanup zip handler
                        // r2Publication.freeDestroy();
                        send(500, "no cover link");
                        return;
                    }

                    const zipStream = await zip.entryStreamPromise(coverLink.Href);
                    const zipBuffer = await streamToBufferPromise(zipStream.stream);

                    // after PublicationParsePromise, cleanup zip handler
                    // r2Publication.freeDestroy();

                    // Remove start dot in extensoion
                    const coverExt = extname(coverLink.Href).slice(1);
                    const coverFilename = filename + "." + coverExt;

                    // ==
                    // THORIUM_READER

                    const { url: urlCover } = await save(zipBuffer, coverFilename);

                    // @ts-ignore
                    publication.AddImage(urlCover, coverLink.TypeLink);

                    const { url: urlPub } = await save(buffer, filename);

                    publication.AddLink_(urlPub, epubTypeLink, "http://opds-spec.org/acquisition/open-access", "");

                    const publicationSaved = await savePublicationInDb(publication);

                    send(200, "", TaJsonSerialize(publicationSaved));

                } catch (e) {
                    send(500, e.toString(), e.stack);
                }
            } else {
                send(400, "the file uploaded is not a zip");
            }
        } else {
            send(400, "not a valid file uploaded");
        }
    } else {
        send(400, "content-type is not for an epub file");
    }
};

export const delete_ = async (req: functions.https.Request, res: functions.Response<any>) => {

    const send = response(res);

    console.log("DELETE");
    

    let filename = req.query["id"];
    if (typeof filename === "string" && filename) {

        const id = decodeURI(filename);
        try {
            
            const publication = await getPublicationInDb(id);

            console.log("publication found");
            
            try {
                const acquiLink = publication.Links.find((l) => l.HasRel("http://opds-spec.org/acquisition/open-access"))?.Href || "";
                const url = new URL(acquiLink);
                const name = basename(url.pathname);

                console.log("delete epub");

                await deleteFile(name);
            } catch (e) {
                console.log(e);
                throw new Error("epub file in storage not removed ;; ");
            }
            try {
                const acquiLink = publication.Images.find((l) => l.HasRel("cover"))?.Href || "";
                const url = new URL(acquiLink);
                const name = basename(url.pathname);

                console.log("delete cover");

                await deleteFile(name);
            } catch (e) {
                throw new Error("cover image in storage not removed ;; ");
            }

            try {
                console.log("delete publication in db");
    
                await deletePublicationInDb(id);
            } catch (e) {
                console.log(e);
                throw new Error("publication not deleted in db ;; ");
            }

            send(200);

        } catch (e) {
            send(500, e.toString(), e.stack);
        }
    }

}