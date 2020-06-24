import * as functions from "firebase-functions";
// import { createFeed } from "./feed.service";
import { TaJsonSerialize } from "r2-lcp-js/dist/es8-es2017/src/serializable";
import { createFeed } from "./feed.service";
// import * as admin from "firebase-admin";



export const sync = functions.firestore.document("publication/{id}").onWrite(
    (change, context) => {

        // generate the new feed id db


    }
);

export const feedFn = async (req: functions.https.Request, res: functions.Response<any>) => {

    const feed = await createFeed();
    const ser = TaJsonSerialize(feed);

    res.status(200).json(ser);
}