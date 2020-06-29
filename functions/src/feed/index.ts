import * as functions from "firebase-functions";
import { findAndReturnFeed, searchRequest } from "./controller";
import { updateFeed } from "./service";

export const sync = functions.firestore.document("publication/{id}").onWrite(
    async (change, context) => {

        // generate the new feed id db
        // TODO: need optimisation
        await updateFeed();
    }
);

export const feedFn = async (req: functions.https.Request, res: functions.Response<any>) => {

    if (req.path || Object.keys(req.query).length) {
        
        // handle path and query params here
        return await searchRequest(req, res);
    } else {
        return await findAndReturnFeed(req, res);
    }

}