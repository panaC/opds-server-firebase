import * as functions from "firebase-functions";
import { response } from "../utils/response";
import { create, delete_ } from "./controller";

export const storageFunction = async (req: functions.https.Request, res: functions.Response<any>) => {

    res.set('Access-Control-Allow-Origin', '*')
    const send = response(res);

    try {

        switch (req.method) {
            case "POST":
            case "PUT": {
                return await create(req, res);
            }

            case "DELETE": {
                return await delete_(req, res);
            }

            default: {
                return send(405, "method not allowed");
            }
        }

    } catch (e) {
        return send(500, e.toString());
    }

};