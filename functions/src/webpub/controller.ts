import { plainToClass } from "class-transformer";
import { validateOrReject } from "class-validator";
import * as functions from "firebase-functions";
import { basename } from "path";
import { TaJsonDeserialize, TaJsonSerialize } from "r2-lcp-js/dist/es8-es2017/src/serializable";
import { Publication as R2Publication } from "r2-shared-js/dist/es8-es2017/src/models/publication";
import { JSON as TAJSON } from "ta-json-x";

import { IWebpubDb } from "../db/interface/webpub.interface";
import { response } from "../utils/response";
import { WebpubDto } from "./dto/webpub.dto";
import {
    deletePublicationInDb, getAllPublication, getPublicationInDb, savePublicationInDb,
    updatePublicationInDb,
} from "./service";
import { isAuthentified } from "../utils/auth";

export const handleWebpub = async (
    req: functions.https.Request,
    res: functions.Response<any>,
    callBack: (publication: R2Publication) => Promise<IWebpubDb["publication"]>,
    method: string
) => {
    const send = response(res);
    const auth = await isAuthentified(req.headers.authorization);
    if (!auth) {
        return send(401, "not authentified");
    }

    let webpubParsedWithJson: Object;
    let publicationParsed: R2Publication;
    let pubStringified: string;
    try {

        const body = req.body;

        if (Buffer.isBuffer(body)) {
            pubStringified = body.toString();

            webpubParsedWithJson = JSON.parse(pubStringified);
            publicationParsed = TAJSON.parse(pubStringified, R2Publication)

        } else if (typeof body === "string") {
            pubStringified = body;

            webpubParsedWithJson = JSON.parse(pubStringified);
            publicationParsed = TAJSON.parse(pubStringified, R2Publication)

        } else if (typeof body === "object") {

            webpubParsedWithJson = body;
            publicationParsed = TaJsonDeserialize(body, R2Publication);

        } else {
            throw new Error("unknown body type");
        }

        // debug only
        // writeFileSync("./test.json", JSON.stringify(publicationParsedWithJSON));

    } catch (e) {

        console.error("webpub parsing error");
        console.error(e);
        return send(400, "webpub parsing error", e.toString());
    }

    try {
        const webpubClass = plainToClass(WebpubDto, webpubParsedWithJson);
        await validateOrReject(webpubClass);

    } catch (e) {

        console.error("webpub not valid");
        console.error(e);
        return send(400, "readium web publication not valid", e instanceof Error ? e.toString() : e);
    }

    try {
        const publication = await callBack(publicationParsed);
        return send(201, "", TaJsonSerialize(publication));
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
    const id = basename(req.path);

    if (typeof id === "string" && id) {
        return await handleWebpub(req, res, async (publication) => {
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
    const id = basename(req.path);

    const auth = await isAuthentified(req.headers.authorization);
    if (!auth) {
        return send(401, "not authentified");
    }

    if (typeof id === "string" && id) {
        
        try {
            await deletePublicationInDb(decodeURI(id));
            return send(204);

        } catch (e) {

            console.error("deletePublicationInDb");
            console.error(e);
            return send(500, "Error to delete the webpub from DB", e.toString());

        }
    } else {

        return send(400, "the value of 'id' key is not a string");
    }
}
