import * as functions from "firebase-functions";
// import * as admin from "firebase-admin";
import { response } from "../utils/response";
import { create, read, update, delete_ } from "./controller";
import { initGlobalConverters_GENERIC, initGlobalConverters_SHARED } from "r2-shared-js/dist/es8-es2017/src/init-globals";

initGlobalConverters_GENERIC();
initGlobalConverters_SHARED();

export const webpubFonction = async (req: functions.https.Request, res: functions.Response<any>) => {

    res.set('Access-Control-Allow-Origin', '*')
    const send = response(res);

    try {

        switch (req.method) {
            case "POST": {
                return await create(req, res);
            }

            case "GET": {
                return await read(req, res);
            }

            case "PUT": {
                return await update(req, res);
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