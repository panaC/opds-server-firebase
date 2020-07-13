import { plainToClass } from "class-transformer";
import { validateOrReject } from "class-validator";
import * as functions from "firebase-functions";
import { basename } from "path";
import { TaJsonDeserialize, TaJsonSerialize } from "r2-lcp-js/dist/es8-es2017/src/serializable";
import { OPDSPublication } from "r2-opds-js/dist/es8-es2017/src/opds/opds2/opds2-publication";
import { JSON as TAJSON } from "ta-json-x";

import { IPublicationDb } from "../db/interface/publication.interface";
import { response } from "../utils/response";
import { PublicationDto } from "./dto/publication.dto";
import {
    deletePublicationInDb, getAllPublication, getPublicationInDb, savePublicationInDb,
    updatePublicationInDb,
} from "./service";

// import { writeFileSync } from "fs";

export const handlePublication = async (
    req: functions.https.Request,
    res: functions.Response<any>,
    callBack: (publication: OPDSPublication) => Promise<IPublicationDb["publication"]>,
    method: string
) => {
    const send = response(res);

    // console.log("body", req.body);
    // console.log("rawbody", req.rawBody);
    // console.log("req headers", req.headers);
    // console.log("req method", req.method);
    // console.log("req params", req.params);
    // console.log("req query", req.query);

    let publicationParsedWithJSON: Object;
    let publicationParsed: OPDSPublication;
    let pubStringified: string;
    try {

        const body = req.body;

        if (Buffer.isBuffer(body)) {
            pubStringified = body.toString();

            publicationParsedWithJSON = JSON.parse(pubStringified);
            publicationParsed = TAJSON.parse(pubStringified, OPDSPublication)

        } else if (typeof body === "string") {
            pubStringified = body;

            publicationParsedWithJSON = JSON.parse(pubStringified);
            publicationParsed = TAJSON.parse(pubStringified, OPDSPublication)

        } else if (typeof body === "object") {

            publicationParsedWithJSON = body;
            publicationParsed = TaJsonDeserialize(body, OPDSPublication);

        } else {
            throw new Error("unknown body type");
        }

        // debug only
        // writeFileSync("./test.json", JSON.stringify(publicationParsedWithJSON));

    } catch (e) {

        console.error("publication parsing error");
        console.error(e);
        return send(400, "publication parsing error");
    }

    try {
        const pubClass = plainToClass(PublicationDto, publicationParsedWithJSON);
        await validateOrReject(pubClass);

    } catch (e) {

        console.error("publication not valid");
        console.error(e);
        return send(400, "OPDSPublication not valid", e instanceof Error ? e.toString() : e);
    }

    try {
        const publication = await callBack(publicationParsed);
        return send(201, "", TaJsonSerialize(publication));
    } catch (e) {

        console.error(method, publicationParsed);
        console.error(e);
        return send(500, "Error to " + method + " the publication in DB", e.toString());
    }
}

export const create = async (req: functions.https.Request, res: functions.Response<any>) => {

    return await handlePublication(req, res, async (publication) => {
        return await savePublicationInDb(publication);
    }, "save");
}

export const update = async (req: functions.https.Request, res: functions.Response<any>) => {

    const send = response(res);
    const id = basename(req.path);

    if (typeof id === "string" && id) {
        return await handlePublication(req, res, async (publication) => {
            return await updatePublicationInDb(decodeURI(id), publication);
        }, "update");
    } else {

        return send(400, "the value of 'id' key is not a string");
    }
}

export const read = async (req: functions.https.Request, res: functions.Response<any>) => {

    const send = response(res);
    const id = basename(req.path);

    if (id) {

        if (typeof id !== "string") {

            return send(400, "the value of 'id' key is not a string");
        }

        try {
            const publication = await getPublicationInDb(decodeURI(id));
            return send(200, "", TaJsonSerialize(publication));

        } catch (e) {

            console.error("getPublicationWithId");
            console.error(e);
            return send(500, "Error to get the publication from DB", e.toString());

        }

    } else {

        try {
            const publication = await getAllPublication();
            return send(200, "", publication.map((pub) => TaJsonSerialize(pub)));

        } catch (e) {

            console.error("getAllPublication");
            console.error(e);
            return send(500, "Error to get all publication from DB", e.toString());

        }
    }
};

export const delete_ = async (req: functions.https.Request, res: functions.Response<any>) => {

    const send = response(res);
    const id = basename(req.path);

    if (typeof id === "string" && id) {
        
        try {
            await deletePublicationInDb(decodeURI(id));
            return send(204);

        } catch (e) {

            console.error("deletePublicationInDb");
            console.error(e);
            return send(500, "Error to delete the publication from DB", e.toString());

        }
    } else {

        return send(400, "the value of 'id' key is not a string");
    }

}
