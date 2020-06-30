import { Publication as R2Publication } from "r2-shared-js/dist/es8-es2017/src/models/publication";

export interface IWebpubDb {
    publication: R2Publication;
    popularityCounter: number;
    createTimestamp: number;
    modifiedTimestamp: number;
}