import * as functions from "firebase-functions";
// import * as admin from "firebase-admin";
import { response } from "../utils/response";
import { post } from "./controller/post";

export const webpubFonction = async (req: functions.https.Request, res: functions.Response<any>) => {

    const send = response(res);

    try {

        switch (req.method) {
            case "POST": {
                return await post(req, res);
            }

            default: {
                return send(405, "method not allowed");
            }
        }

    } catch (e) {
        return send(500, e.toString());
    }

};