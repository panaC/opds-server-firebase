import { IParsedQuery } from "../query.type";
import { OPDSPublication } from "r2-opds-js/dist/es8-es2017/src/opds/opds2/opds2-publication";
import { publicationDb } from "../../db/publication";
import { /*PUBLICATION_NUMBER_LIMIT,*/ groupsAllowed } from "../constant";
import { IPublicationDb } from "../../db/interface/publication.interface";

export const searchPublication = async (query: IParsedQuery): Promise<OPDSPublication[]> => {

    let publication = new Array<OPDSPublication>();

    // const page = query.page || 1;
    const number = query.number || 0;
    const queryFromQuery = query.query;
    const title = query.title;
    const author = query.author;
    const subject = query.subject;
    const publisher = query.publisher;
    const language = query.language;
    const group = query.group;

    // let dbQuery = publicationDb;
        // .startAt((page - 1) * PUBLICATION_NUMBER_LIMIT)
        // .endAt(page * PUBLICATION_NUMBER_LIMIT);
    let dbQuery = publicationDb as FirebaseFirestore.Query<IPublicationDb>;
    if (number) {
        dbQuery = dbQuery.limit(number);
    }

    if (group) {
        if (group === groupsAllowed.mostDownloaded) {
            dbQuery = dbQuery.orderBy("popularityCounter", "desc");
        } else if (group === groupsAllowed.mostRecent) {
            dbQuery = dbQuery.orderBy("modifiedTimestamp", "desc");
        }
    }

    if (queryFromQuery) {
        dbQuery = dbQuery.where("publication/metadata/title", "==", queryFromQuery);
    } else {
        if (title) {
            dbQuery = dbQuery.where("publication/metadata/title", "==", title);
        } else if (author) {
            dbQuery = dbQuery.where("publication/metadata/author", "==", author);
        }
    }

    if (subject) {
        dbQuery = dbQuery.where("publication/metadata/subject", "==", subject);
    }
    if (publisher) {
        dbQuery = dbQuery.where("publication/metadata/publisher", "==", publisher);
    }
    if (language) {
        dbQuery = dbQuery.where("publication/metadata/language", "==", language);
    }

    const snap = await dbQuery.get();

    if (!snap.empty) {
        publication = snap.docs.map(
            (d) => d.data().publication,
        );
    }
    return publication;
}
