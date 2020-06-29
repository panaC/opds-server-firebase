import * as functions from "firebase-functions";
import { findAndReturnFeed, searchRequest } from "./controller";
import { updateFeed } from "./service";
import { response } from "../utils/response";

export const sync = functions.firestore.document("/publication/{id}").onWrite(
    async (change, context) => {

        // works online but not offline in simulators

        // generate the new feed id db
        // TODO: need optimisation
        // TODO : verify if feed already exists
        await updateFeed();

        console.log("change", change);
        console.log("context", context);
        
        


        console.log("FEED updated");
        
    }
);

export const feedFn = async (req: functions.https.Request, res: functions.Response<any>) => {

    const send = response(res);
    try {

        switch (req.method) {

            case "GET": {

                console.log("path", req.path);
                console.log("query", req.query);

                if (req.path !== "/" || Object.keys(req.query).length) {

                    // handle path and query params here
                    return await searchRequest(req, res);
                } else {
                    return await findAndReturnFeed(req, res);

                }
            }

            default: {
                return send(405, "method not allowed");
            }
        }

    } catch (e) {
        return send(500, e.toString());
    }
}