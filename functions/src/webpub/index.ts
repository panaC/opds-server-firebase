import * as functions from "firebase-functions";
// import * as admin from "firebase-admin";
import { plainToClass } from "class-transformer";
import { WebpubDto } from "./dto/webpub.dto";
import { validate } from "class-validator";

export const webpubFonction = async (req: functions.https.Request, res: functions.Response<any>) => {

    try {
        if (req.method === "POST") {
    
            let webpubRaw: Object = {};
            try {
                webpubRaw = JSON.parse(req.body["webpub"]);

            } catch (e) {
                // ignore
            }
            if (Object.keys(webpubRaw).length) {

                const webpubClass = plainToClass(WebpubDto, webpubRaw);
                const validError = await validate(webpubClass);
    
                if (validError.length) {
                    res.status(400).send({
                        status: "err",
                        err: "readium web publication not valid",
                        data: validError,
                    })
                } else {
                    res.status(200).send({
                        status: "ok",
                    });
                }
            } else {
                res.status(400).send({
                    status: "err",
                    err: "body is not a json object",
                })
            }
        } else {
            res.status(405).send({
                status: "err",
                err: "method not allowed"
            });
        }
    } catch (e) {
        res.status(500).send({
            status: "err",
            err: e.toString(),
        })
    }
};