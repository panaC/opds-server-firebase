import { IParsedQuery } from "../query.type";
import { OPDSPublication } from "r2-opds-js/dist/es8-es2017/src/opds/opds2/opds2-publication";
import { publicationDb } from "../../db/publication";
import { groupsAllowed, algoliaEnabled } from "../../constant";
import { algoliaIndex } from "../../utils/algolia";
import { IPublicationDb } from "../../db/interface/publication.interface";

export const searchPublication = async (query: IParsedQuery, limit: number): Promise<[OPDSPublication[], number]> => {

    let publication = new Array<OPDSPublication>();
    let nbPublication = 0;

    const queryFromQuery = query.query;

    try {
        
        if (queryFromQuery && algoliaEnabled) {
            console.log("search with algolia", queryFromQuery);

            const search = await algoliaIndex.search(queryFromQuery);
            const hits = search.hits;

            const pubPromise = hits
                .slice(0, limit)
                .map(async (o) => (await publicationDb.doc(o.objectID).get()).data()?.publication)

            const pubNotFiltered = await Promise.all(pubPromise)
            const pub = pubNotFiltered.filter((p) => p) as OPDSPublication[];

            return [pub, pub.length];
        }
    } catch (e) {
        console.log("error to search in algolia");
        console.log(e);

    }

    const page = query.page || 1;
    const title = query.title;
    const author = query.author;
    const subject = query.subject;
    const publisher = query.publisher;
    const language = query.language;
    const group = query.group;

    let dbQuery = publicationDb as FirebaseFirestore.Query<IPublicationDb>;

    if (group) {
        if (group === groupsAllowed.mostDownloaded) {
            dbQuery = dbQuery.orderBy("popularityCounter", "desc");
        } else if (group === groupsAllowed.mostRecent) {
            dbQuery = dbQuery.orderBy("modifiedTimestamp", "desc");
        }
    }

    if (queryFromQuery) {
        dbQuery = dbQuery.where("metadataTitle", "array-contains", queryFromQuery);
    } else {
        if (title) {
            dbQuery = dbQuery.where("metadataTitle", "array-contains", title);
        } else if (author) {
            dbQuery = dbQuery.where("metadataAuthor", "array-contains", author);
        }
    }

    if (subject) {
        dbQuery = dbQuery.where("metadataSubject", "array-contains", subject);
    }
    if (publisher) {
        dbQuery = dbQuery.where("metadataPublisher", "array-contains", publisher);
    }
    if (language) {
        dbQuery = dbQuery.where("metadataLanguage", "array-contains", language);
    }

    {
        const snap = await dbQuery.get();
        nbPublication = snap.size;
    }

    const offset = (page - 1) * limit;
    if (offset) {
        dbQuery = dbQuery.offset(offset);
    }
    if (limit) {
        dbQuery = dbQuery.limit(limit);
    }

    {
        const snap = await dbQuery.get();
        if (!snap.empty) {
            publication = snap.docs
                .map(
                    (d) => d.data()?.publication,
                )
                .filter((v) => v) as OPDSPublication[];
        }
    }


    return [publication, nbPublication];
}
