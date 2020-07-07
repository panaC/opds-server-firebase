import { db } from "./db";
import { IWebpubDb } from "./interface/webpub.interface";
import { Publication as R2Publication } from "r2-shared-js/dist/es8-es2017/src/models/publication";
import { TaJsonSerialize, TaJsonDeserialize } from "r2-lcp-js/dist/es8-es2017/src/serializable";

const webpubConverter: FirebaseFirestore.FirestoreDataConverter<IWebpubDb> = {
    toFirestore: (obj) => {
        // update fonction doesn't call this function , why !!?!!
        // wherase set function works
        // and it's create a type error on publication

        return ({
            ...obj,

            publication: TaJsonSerialize(obj.publication),
            modifiedTimestamp: Date.now(),
        })
    },

    fromFirestore: (obj) => {

        let publication: R2Publication;
        try {
            publication = TaJsonDeserialize(obj.publication, R2Publication);
        } catch (e) {

            // fallback to not set undefined publication in from and to
            publication = new R2Publication();
        }

        return {
            publication,
            modifiedTimestamp: obj.modifiedTimestamp,
            createTimestamp: obj.createTimestamp,
            popularityCounter: obj.popularityCounter,
        };
    },
}

export const webpubDb = db
    .collection("webpub")
    .withConverter(webpubConverter) as FirebaseFirestore.CollectionReference<IWebpubDb>;