import { feedDoc } from "../db/feed";
import { IFeedDoc } from "../db/interface/feed.interface";
import { createHomeFeed } from "./createFeed";
import { TaJsonSerialize } from "r2-lcp-js/dist/es8-es2017/src/serializable";
import * as qs from "qs";
import { TQuery, IParsedQuery, TQueryAllowed } from "./query.type";
import { queryAllowed } from "./constant";
// import { OPDSFeed } from "r2-opds-js/dist/es8-es2017/src/opds/opds2/opds2";

export const pathToQuery = (path: string): TQuery => {

    const split = path.split("/");
    const str = split.filter((s) => s);
    const twin = str.reduce((pv, cv, i, a) => i % 2 ? ({ ...pv, [a[i-1]]:cv }) : pv , {});

    return twin;
}

export const queryToQuery =
    (query: qs.ParsedQs): TQuery =>
        Object.entries(query)
            .reduce(
                (pv, [key, value]) =>
                    typeof value === "string" ? ({ ...pv, [key]: value }) : pv,
                {},
            );

export const queryToPath = (query: IParsedQuery, mergeToQuery?: IParsedQuery): string =>
    Object.entries(
        mergeQuery(query, mergeToQuery)
    )
        .reduce(
            (pv, [key, value]) => pv + key + "/" + value + "/",
            "/",
        );

export const mergeQuery = <T extends IParsedQuery | TQuery>(a: T, b?: T): T=>
    a && b ? { ...a, ...b } : a;

export const createFeed = async () => {
    const opdsFeed = await createHomeFeed();
    const feed = TaJsonSerialize(opdsFeed);

    return feed;
}

export const updateFeed = async () => {
    const feed = await createFeed();
    await feedDoc.update(feed);
}

export const getFeed = async () => {
    // let feed: IFeedDoc = {};

    const doc = await feedDoc.get();
    if (doc.exists) {
        console.log("feed exists return feed");
        
        return doc.data() as IFeedDoc;
    } else {
        console.log("feed doesn't exists create it");
        
        const feed = await createFeed();
        await feedDoc.set(feed);

        return feed;
    }
}

export const parseQuery = (query: TQuery): IParsedQuery => {

    let o: IParsedQuery = {};

    Object.entries(query).forEach((q) => {
        const [key, value] = q as [TQueryAllowed, string | undefined]

        switch (key) {

            case queryAllowed.author:
            case queryAllowed.group:
            case queryAllowed.language:
            case queryAllowed.publisher:
            case queryAllowed.query:
            case queryAllowed.title:
            case queryAllowed.subject:

                if (value && typeof value === "string") {
                    // @ts-ignore
                    o[key] = value;
                }

                break;
        
            case queryAllowed.page:

                if (value && typeof value === "string") {
                    
                    const a = value;
                    const b = parseInt(a, 10);
                    const c = isNaN(b) || b < 1 ? 1 : b;
                    o.page = c;
                }

                break;

            case queryAllowed.number:

                if (value && typeof value === "string") {
                    
                    const a = value;
                    const b = parseInt(a, 10);
                    const c = isNaN(b) || b < 0 ? 0 : b;
                    o.number = c;
                }

                break;

            default:
                break;
        }
    })

    return o;

};
