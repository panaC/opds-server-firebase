
import * as functions from "firebase-functions";
import { getFeed } from "./service";
import { response } from "../utils/response";

export const searchRequest = async (req: functions.https.Request, res: functions.Response<any>) => {

    const send = response(res);

    send(404, "not yet implemented");
};

export const findAndReturnFeed = async (req: functions.https.Request, res: functions.Response<any>) => {
    
    const send = response(res);

    try {
        const feed = await getFeed();
        send(200, "", feed);
    } catch (e) {
        send(500, "can't return opdsFeed", e);
    }

};