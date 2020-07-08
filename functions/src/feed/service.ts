import { feedDoc } from "../db/feed";
import { IFeedDoc } from "../db/interface/feed.interface";
import { createHomeFeed } from "./createFeed";
import { TaJsonSerialize } from "r2-lcp-js/dist/es8-es2017/src/serializable";
import * as qs from "qs";
import { TQuery, IParsedQuery, TQueryAllowed } from "./query.type";
import { queryAllowed, queryQueryQMapping, isAGoodArray, queryPageTitle } from "../constant";

const nor = (v: any): string | undefined => {

    const str = (s: any) => {
        if (s && typeof s === "string") {
            return s as string;
        }
        return undefined;
    }
    
    if (isAGoodArray(v)) {
        return (v as any[]).reduce((_pv, cv) => str(cv), undefined);
    }
    return str(v);
}

export const pathToQuery = (path: string): TQuery => {

    const split = path.split("/");
    const str = path[0] === "/" ? split.slice(1) : split;
    const twin = str.reduce((pv, cv, i, a) => i % 2 ? ({ ...pv, [a[i-1]]:cv }) : pv , {});

    return twin;
}

export const queryToQuery =
    (query: qs.ParsedQs): TQuery =>
        Object.entries(query)
            .reduce(
                (pv, [key, value]) => {

                    const v = nor(value);
                    if (v) {
                        return { ...pv, [key]: v};                        
                    }
                    return pv;
                },
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

export const setFeed = async () => {
    const feed = await createFeed();
    await feedDoc.set(feed);
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
        
        const feed = await setFeed();
        return feed;
    }
}

const parseNb = (n: string, def = 0): number => {
    const a = decodeURI(n);
    const b = parseInt(a, 10);
    const c = isNaN(b) || b < def ? def : b;

    return c;
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
            case queryAllowed.subject: {

                const v = nor(value);
                if (v) {
                    // @ts-ignore
                    o[key] = decodeURI(v);
                }
                break;
            }

            case queryQueryQMapping: {

                const v = nor(value);
                if (v) {
                    // @ts-ignore
                    o[queryAllowed.query] = decodeURI(v);
                }
                break;
            }

            case queryAllowed.page: {

                const v = nor(value);
                if (v) {
                    o.page = parseNb(v, 1);
                }
                break;
            }                

            case queryAllowed.number: {

                const v = nor(value);
                if (v) {
                    o.number = parseNb(v, 0);
                }
                break;
            }

            case queryPageTitle: {

                const v = nor(value);
                if (v) {
                    o[queryPageTitle] = decodeURI(v);
                }
                break;
            }

            default: {
                // nothing
            }
        }
    })

    return o;

};
