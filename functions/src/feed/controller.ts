
import * as functions from "firebase-functions";
import { getFeed, pathToQuery, queryToQuery, mergeQuery, parseQuery } from "./service";
import { response } from "../utils/response";
import { createFeed } from "./createFeed";
import { TaJsonSerialize } from "r2-lcp-js/dist/es8-es2017/src/serializable";
import { searchPublication } from "./db/search";
// import { OPDSFeed } from "r2-opds-js/dist/es8-es2017/src/opds/opds2/opds2";

export const searchRequest = async (req: functions.https.Request, res: functions.Response<any>) => {

    const send = response(res);

    try {
        const queryFromPath = pathToQuery(req.path);
        const queryFromQuery = queryToQuery(req.query);
        const queryRaw = mergeQuery(queryFromPath, queryFromQuery);
        const query = parseQuery(queryRaw);

        const title = "??";
        const publication = await searchPublication(query);
        const opdsFeed = await createFeed(publication, query, title);

        const feed = TaJsonSerialize(opdsFeed);
        send(200, "", feed);

    } catch (e) {
        send(500, "error", e.toString());
    }

};

export const findAndReturnFeed = async (req: functions.https.Request, res: functions.Response<any>) => {
    
    const send = response(res);

    try {
        const feed = await getFeed();
        send(200, "", feed);
    } catch (e) {
        send(500, "can't return opdsFeed", e.toString());
    }

};