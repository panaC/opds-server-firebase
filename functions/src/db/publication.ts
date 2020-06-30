import { db } from "./db";
import { IPublicationDb } from "./interface/publication.interface";
import { TaJsonSerialize, TaJsonDeserialize } from "r2-lcp-js/dist/es8-es2017/src/serializable";
import { OPDSPublication } from "r2-opds-js/dist/es8-es2017/src/opds/opds2/opds2-publication";

const publicationConverter: FirebaseFirestore.FirestoreDataConverter<IPublicationDb> = {
    toFirestore: (obj) => ({
        ...obj,
        
        publication: TaJsonSerialize(obj.publication),
        modifiedTimestamp: Date.now(),
    }),

    fromFirestore: (obj) => ({
        publication: TaJsonDeserialize(obj.publication, OPDSPublication),
        modifiedTimestamp: obj.modifiedTimestamp,
        createTimestamp: obj.createTimestamp,
        popularityCounter: obj.popularityCounter,
    })
}

export const publicationDb = db
    .collection("publication")
    .withConverter(publicationConverter);