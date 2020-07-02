import * as functions from "firebase-functions";
import { findAndReturnFeed, searchRequest } from "./controller";
import { updateFeed, setFeed, pathToQuery, queryToQuery, mergeQuery, parseQuery } from "./service";
import { response } from "../utils/response";

export const sync = functions.firestore.document("/publication/{id}").onWrite(
    async (change, context) => {

        console.log("change", change);
        console.log("context", context);

        try {
            await updateFeed();
        } catch (e) {
            console.log("no feed found");
            
            try {
                await setFeed();
            } catch (e) {
                console.log("error to create feed", e);
                
                return ;
            }
        }

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

                const queryFromPath = pathToQuery(req.path);
                const queryFromQuery = queryToQuery(req.query);
                const queryRaw = mergeQuery(queryFromPath, queryFromQuery);
                const query = parseQuery(queryRaw)

                if (Object.keys(query).length) {

                    return await searchRequest(query, res);
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
