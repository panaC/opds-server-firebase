import { IParsedQuery } from "../query.type";
import { OPDSPublication } from "r2-opds-js/dist/es8-es2017/src/opds/opds2/opds2-publication";
import { publicationDb } from "../../db/publication";
import { PUBLICATION_NUMBER_LIMIT } from "../constant";
import { TaJsonDeserialize } from "r2-lcp-js/dist/es8-es2017/src/serializable";

export const searchPublication = async (query: IParsedQuery): Promise<OPDSPublication[]> => {

    // const publication = new Array<OPDSPublication>();

    // const limit = query.number;
    // const groups = query.group;

    // TEST
    const doc = await publicationDb.orderBy("modifiedTimestamp", "desc").limit(PUBLICATION_NUMBER_LIMIT).get();
    const publication = doc.docs
        .map((d) => d.data()?.publication)
        .filter((v) => v)
        .map((d) => TaJsonDeserialize(d, OPDSPublication));


    return publication;
}