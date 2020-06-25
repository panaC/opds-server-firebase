import * as functions from "firebase-functions";
import { findAndReturnFeed, searchRequest } from "./controller";

export const sync = functions.firestore.document("publication/{id}").onWrite(
    (change, context) => {

        // generate the new feed id db

    }
);

export const feedFn = async (req: functions.https.Request, res: functions.Response<any>) => {

    if (req.path || req.query) {
        
        // handle path and query params here
        return await searchRequest(req, res);
    } else {
        return await findAndReturnFeed(req, res);
    }

}