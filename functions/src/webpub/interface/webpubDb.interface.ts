import { JsonMap } from "r2-lcp-js/dist/es8-es2017/src/serializable";

export interface IWebpubDb {
    publication: JsonMap;
    popularityCounter: number;
    createTimestamp: number;
    modifiedTimestamp: number;
}