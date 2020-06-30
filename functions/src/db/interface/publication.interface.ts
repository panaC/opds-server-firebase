import { OPDSPublication } from "r2-opds-js/dist/es8-es2017/src/opds/opds2/opds2-publication";

export interface IPublicationDb {
    publication: OPDSPublication;
    popularityCounter: number;
    createTimestamp: number;
    modifiedTimestamp: number;
}