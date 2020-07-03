import { OPDSPublication } from "r2-opds-js/dist/es8-es2017/src/opds/opds2/opds2-publication";
import { JsonMap } from "r2-lcp-js/dist/es8-es2017/src/serializable";

export interface IPublicationDb {
    publication: OPDSPublication;
    publicationNotParsed?: JsonMap;
    popularityCounter: number;
    createTimestamp: number;
    modifiedTimestamp: number;
    metadataLanguage?: string[];
    metadataSubject?: string[];
}