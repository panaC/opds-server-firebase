import * as functions from "firebase-functions";
import { plainToClass } from "class-transformer";
import { WebpubDto } from "./dto/webpub.dto";
import { validateOrReject } from "class-validator";
import { response } from "../utils/response"
import { savePublicationInDb } from "./service";
import { Publication as R2Publication } from "r2-shared-js/dist/es8-es2017/src/models/publication";
import { JSON as TAJSON } from "ta-json-x";

export const post = async (req: functions.https.Request, res: functions.Response<any>) => {

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
        return send(400, "readium web publication not valid", e);
    }

    let publication: R2Publication;
    try {
        publication = await savePublicationInDb(publicationParsed);

    } catch (e) {

        console.error("SavePublicationInDb", publicationParsed);
        console.error(e);
        return send(500, "Error to save the publication in DB", e.toString());
    }

    return send(200, "", publication);
};
