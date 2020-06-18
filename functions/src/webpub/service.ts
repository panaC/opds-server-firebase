import { Publication as R2Publication } from "r2-shared-js/dist/es8-es2017/src/models/publication";
import { webpubDb } from "./db";
import { TaJsonSerialize } from "r2-lcp-js/dist/es8-es2017/src/serializable";

export const savePublicationInDb = async (publication: R2Publication) => {

    let pubId = publication.Metadata.Identifier;

    const insertDoc = async (id?: string) => {

        const doc = {
            popularityCounter: 0,
            publication: TaJsonSerialize(publication),
        };

        if (id) {
            await webpubDb.doc(id).set(doc);
        } else {
            const document = await webpubDb.add(doc);
            id = document.id;
        }
        publication.Metadata.Identifier = id;

    }

    if (pubId) {
        // find publication in DB
        // if exists -> error

        const document = await webpubDb.doc(pubId).get();
        if (document.exists) {
            throw new Error("publication already exists");
        } else {
            await insertDoc(pubId);
        }
    } else {
        // insert in db with a randomId
        await insertDoc();
    }

    return publication;
}
