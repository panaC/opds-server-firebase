import { OPDSPublication } from "r2-opds-js/dist/es8-es2017/src/opds/opds2/opds2-publication";
import { IPublicationDb } from "../db/interface/publication.interface";
import { nanoid } from "nanoid";
import { publicationDb } from "../db/publication";
import { TaJsonSerialize } from "r2-lcp-js/dist/es8-es2017/src/serializable";

export const savePublicationInDb = async (publication: OPDSPublication): Promise<IPublicationDb["publication"]> => {
    
    const pubId = publication.Metadata.Identifier = publication.Metadata.Identifier || nanoid();
    const doc: IPublicationDb = {
        popularityCounter: 0,
        publication: publication,
        createTimestamp: Date.now(),
        modifiedTimestamp: Date.now(),
    };
    
    const document = await publicationDb.doc(pubId).get();
    if (document.exists) {
        throw new Error("publication already exists");
    } else {
        await publicationDb.doc(pubId).set(doc);
    }

    return doc.publication;
}

export const getPublicationInDb = async (id: string): Promise<IPublicationDb["publication"]> => {

    const document = await publicationDb.doc(id).get();
    const publication = document.data()?.publication;
    if (publication) {
        return publication
    } else {
        throw new Error("publication not found");
    }
}

export const getAllPublication = async (): Promise<IPublicationDb["publication"][]> => {

    const document = await publicationDb.get();
    return document.docs.map((v) => v.data().publication);
}

export const updatePublicationInDb = async (id: string, publication: OPDSPublication): Promise<IPublicationDb["publication"]> => {

    const ref = publicationDb.doc(id);
    const document = await ref.get();
    if (document.exists && document.data()) {
        const data = document.data() as IPublicationDb; // bad infer
        const doc: IPublicationDb = {
            ...data,
            popularityCounter: typeof data.popularityCounter === "number" ? data.popularityCounter + 1 : 0,
            modifiedTimestamp: Date.now(),
            // firestore doesn't call 'toFirestore' converter on update request !!
            // need to force cast to any
            // TODO how to improve it ?
            publication: TaJsonSerialize(publication) as any,
        }

        await ref.update(doc);

        return doc.publication;
    } else {
        throw new Error("publication not found");
    }
}

export const deletePublicationInDb = async (id: string) => {

    const ref = publicationDb.doc(id);
    const document = await ref.get();
    if (document.exists) {

        await ref.delete();

    } else {
        throw new Error("publication not found");
    }
}