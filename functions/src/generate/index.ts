
import * as functions from "firebase-functions";
import { response } from "../utils/response";
import { generatePublication, delete_ } from "./controller";

// EXPERIMENTAL
// Not for a production use

export const generateFonction = async (req: functions.https.Request, res: functions.Response<any>) => {

    res.set('Access-Control-Allow-Origin', '*')
    const send = response(res);

    try {

        switch (req.method) {
            case "PUT":
            case "POST": {
                return await generatePublication(req, res);
            }

            // TODO
            // Bug on delete function
            // infinite loop
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
