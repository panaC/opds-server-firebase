import { OPDSPublication } from "r2-opds-js/dist/es8-es2017/src/opds/opds2/opds2-publication";
import { PUBLICATION_NUMBER_LIMIT } from "../constant";
import { publicationDb } from "../../db/publication";

export const getMostRecentPublicationFromDb = async (): Promise<OPDSPublication[]> => {

    const snap = await publicationDb
        .orderBy("modifiedTimestamp", "desc")
        .limit(PUBLICATION_NUMBER_LIMIT)
        .get();
    const docsArray = snap.docs;
    const pubArray = docsArray.map((d) => d.data().publication);

    return pubArray;
};

export const getMostDownloadedPublicationFromDb = async () => {

    const snap = await publicationDb
        .orderBy("popularityCounter", "desc")
        .limit(PUBLICATION_NUMBER_LIMIT)
        .get();
    const docsArray = snap.docs;
    const pubArray = docsArray.map((d) => d.data().publication);

    return pubArray;
};

export const getSubjectPublicationFromDb = async (sub: string) => {

    const snap = await publicationDb
        .where("metadataSubject", "array-contains", sub)
        .limit(PUBLICATION_NUMBER_LIMIT)
        .get();
    const docsArray = snap.docs;
    const pubArray = docsArray.map((d) => d.data().publication);

    return pubArray;
};

export const getPromotePublicationFromDb = async () => {
    return []; // not implemented yet
};
