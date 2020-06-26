import { OPDSPublication } from "r2-opds-js/dist/es8-es2017/src/opds/opds2/opds2-publication";
import { PUBLICATION_NUMBER_LIMIT } from "../constant";
import { TaJsonDeserialize } from "r2-lcp-js/dist/es8-es2017/src/serializable";
import { publicationDb } from "../../db/publication";

export const getMostRecentPublicationFromDb = async (): Promise<OPDSPublication[]> => {

    const doc = await publicationDb.orderBy("modifiedTimestamp", "desc").limit(PUBLICATION_NUMBER_LIMIT).get();
    const data = doc.docs
        .map((d) => d.data()?.publication)
        .filter((v) => v)
        .map((d) => TaJsonDeserialize(d, OPDSPublication));

    return data;
};

export const getMostDownloadedPublicationFromDb = async () => {
    const doc = await publicationDb.orderBy("popularityCounter", "desc").limit(PUBLICATION_NUMBER_LIMIT).get();
    const data = doc.docs
        .map((d) => d.data()?.publication)
        .filter((v) => v)
        .map((d) => TaJsonDeserialize(d, OPDSPublication));

    return data;
};

export const getSubjectPublicationFromDb = async (sub: string) => {
    const doc = await publicationDb.where("publication.metadata.subject", "==", sub).limit(PUBLICATION_NUMBER_LIMIT).get();
    const data = doc.docs
        .map((d) => d.data()?.publication)
        .filter((v) => v)
        .map((d) => TaJsonDeserialize(d, OPDSPublication));

    return data;

};

export const getPromotePublicationFromDb = async () => {
    return []; // not implemented yet
};
