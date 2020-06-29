import { feedDoc } from "../db/feed";
import { IFeedDoc } from "../db/interface/feed.interface";
import { createHomeFeed } from "./createFeed";
import { TaJsonSerialize } from "r2-lcp-js/dist/es8-es2017/src/serializable";
import * as qs from "qs";
import { OPDSFeed } from "r2-opds-js/dist/es8-es2017/src/opds/opds2/opds2";

export type TQuery = { [key: string]:string };
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

export const queryToPath = (query: TQuery, mergeToQuery?: TQuery): string =>
    Object.entries(
        mergeQuery(query, mergeToQuery)
    )
        .reduce(
            (pv, [key, value]) => pv + key + "/" + value,
            "/",
        );

export const mergeQuery = (a: TQuery, b?: TQuery) =>
    a && b ? { ...a, ...b } : a;

export const updateFeed = async () => {
    const opdsFeed = await createHomeFeed();
    const feed = TaJsonSerialize(opdsFeed);
    await feedDoc.update(feed);

    return feed;
}

export const getFeed = async () => {
    // let feed: IFeedDoc = {};

    const doc = await feedDoc.get();
    if (doc.exists) {
        return doc.data() as IFeedDoc;
    } else {
        return await updateFeed();
    }
}