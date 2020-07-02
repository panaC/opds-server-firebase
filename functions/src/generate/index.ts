
import * as functions from "firebase-functions";
import { response } from "../utils/response";
import { generatePublication } from "./controller";

export const generateFonction = async (req: functions.https.Request, res: functions.Response<any>) => {

    res.set('Access-Control-Allow-Origin', '*')
    const send = response(res);

    try {

        switch (req.method) {
            case "POST": {
                return await generatePublication(req, res);
            }

            default: {
                return send(405, "method not allowed");
            }
        }

    } catch (e) {
        return send(500, e.toString());
    }
};
