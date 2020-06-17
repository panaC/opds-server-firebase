import * as functions from "firebase-functions";
// import * as admin from "firebase-admin";
import { plainToClass } from "class-transformer";
import { WebpubDto } from "../dto/webpub.dto";
import { validateOrReject } from "class-validator";
import { response } from "../../utils/response"

export const post = async (req: functions.https.Request, res: functions.Response<any>) => {

    const send = response(res);

    let webpubRaw: Object = {};
    try {
        webpubRaw = JSON.parse(req.body["webpub"]);
    } finally {

        if (Object.keys(webpubRaw).length) {

            const webpubClass = plainToClass(WebpubDto, webpubRaw);
            try {
                await validateOrReject(webpubClass);

            } catch (e) {
                return send(400, "readium web publication not valid", e);
            }

            // save in db here

            return send(200, "", {});
        } else {
            return send(400, "the value of 'webpub' is not a json object");
        }
    }
};