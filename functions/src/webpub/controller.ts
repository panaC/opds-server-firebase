import * as functions from "firebase-functions";
import { plainToClass } from "class-transformer";
import { WebpubDto } from "./dto/webpub.dto";
import { validateOrReject } from "class-validator";
import { response } from "../utils/response"
import { savePublicationInDb, getPublicationInDb, getAllPublication, updatePublicationInDb, deletePublicationInDb } from "./service";
import { Publication as R2Publication } from "r2-shared-js/dist/es8-es2017/src/models/publication";
import { JSON as TAJSON } from "ta-json-x";
import { IWebpubDb } from "../db/interface/webpub.interface";
import { TaJsonSerialize } from "r2-lcp-js/dist/es8-es2017/src/serializable";

export const handleWebpub = async (
    req: functions.https.Request,
    res: functions.Response<any>,
    callBack: (publication: R2Publication) => Promise<IWebpubDb["publication"]>,
    method: string
) => {
    const send = response(res);
    const webpubStringified = req.body["webpub"];

    let webpubParsed: Object;
    let publicationParsed: R2Publication;
    try {
        webpubParsed = JSON.parse(webpubStringified);
        publicationParsed = TAJSON.parse(webpubStringified, R2Publication);
    } catch (e) {

        console.error("webpub parsing error");
        console.error(e);
        return send(400, "the value of 'webpub' key is not a json object");
    }

    try {
        const webpubClass = plainToClass(WebpubDto, webpubParsed);
        await validateOrReject(webpubClass);

    } catch (e) {

        console.error("webpub not valid");
        console.error(e);
        return send(400, "readium web publication not valid", e instanceof Error ? e.toString() : e);
    }

    try {
        const publication = await callBack(publicationParsed);
        return send(200, "", TaJsonSerialize(publication));
    } catch (e) {

        console.error(method, publicationParsed);
        console.error(e);
        return send(500, "Error to " + method + " the webpub in DB", e.toString());
    }
}

export const create = async (req: functions.https.Request, res: functions.Response<any>) => {

    return await handleWebpub(req, res, async (publication) => {
        return await savePublicationInDb(publication);
    }, "save");
}

export const update = async (req: functions.https.Request, res: functions.Response<any>) => {

    const send = response(res);
    const id = req.query["id"];

    if (typeof id === "string" && id) {
        return await handleWebpub(req, res, async (publication) => {
            return await updatePublicationInDb(id, publication);
        }, "update");
    } else {

        return send(400, "the value of 'id' key is not a string");
    }
}

export const read = async (req: functions.https.Request, res: functions.Response<any>) => {

    const send = response(res);
    const id = req.query["id"];

    if (id) {

        if (typeof id !== "string") {

            return send(400, "the value of 'id' key is not a string");
        }

        try {
            const publication = await getPublicationInDb(id);
            return send(200, "", TaJsonSerialize(publication));

        } catch (e) {

            console.error("getPublicationWithId");
            console.error(e);
            return send(500, "Error to get the webpub from DB", e.toString());

        }

    } else {

        try {
            const publication = await getAllPublication();
            return send(200, "", TaJsonSerialize(publication));

        } catch (e) {

            console.error("getAllPublication");
            console.error(e);
            return send(500, "Error to get all webpub from DB", e.toString());

        }
    }
};

export const delete_ = async (req: functions.https.Request, res: functions.Response<any>) => {

    const send = response(res);
    const id = req.query["id"];

    if (typeof id === "string" && id) {
        
        try {
            await deletePublicationInDb(id);
            return send(200);

        } catch (e) {

            console.error("deletePublicationInDb");
            console.error(e);
            return send(500, "Error to delete the webpub from DB", e.toString());

        }
    } else {

        return send(400, "the value of 'id' key is not a string");
    }
}
