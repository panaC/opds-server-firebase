import { Publication as R2Publication } from "r2-shared-js/dist/es8-es2017/src/models/publication";
import { webpubDb } from "./db";
import { TaJsonSerialize } from "r2-lcp-js/dist/es8-es2017/src/serializable";
import { IWebpubDb } from "./interface/webpubDb.interface";
import { nanoid } from "nanoid";

export const savePublicationInDb = async (publication: R2Publication): Promise<IWebpubDb["publication"]> => {
    
    const pubId = publication.Metadata.Identifier = publication.Metadata.Identifier || nanoid();
    const doc: IWebpubDb = {
        popularityCounter: 0,
        publication: TaJsonSerialize(publication),
        createTimestamp: Date.now(),
        modifiedTimestamp: Date.now(),
    };
    
    const document = await webpubDb.doc(pubId).get();
    if (document.exists) {
        throw new Error("publication already exists");
    } else {
        await webpubDb.doc(pubId).set(doc);
    }

    return doc.publication;
}

export const getPublicationInDb = async (id: string): Promise<IWebpubDb["publication"]> => {

    const document = await webpubDb.doc(id).get();
    const publication = document.data()?.publication;
    if (publication) {
        return publication
    } else {
        throw new Error("publication not found");
    }
}

export const getAllPublication = async (): Promise<IWebpubDb["publication"][]> => {

    const document = await webpubDb.get();
    return document.docs.map((v) => v.data().publication);
}

export const updatePublicationInDb = async (id: string, publication: R2Publication): Promise<IWebpubDb["publication"]> => {

    const ref = webpubDb.doc(id);
    const document = await ref.get();
    if (document.exists && document.data()) {
        const data = document.data() as IWebpubDb; // bad infer
        const doc: IWebpubDb = {
            ...data,
            popularityCounter: typeof data.popularityCounter === "number" ? data.popularityCounter + 1 : 0,
            modifiedTimestamp: Date.now(),
            publication: TaJsonSerialize(publication),
        }

        await ref.update(doc);

        return doc.publication;
    } else {
        throw new Error("publication not found");
    }
}

export const deletePublicationInDb = async (id: string): Promise<IWebpubDb["publication"]> => {

    const ref = webpubDb.doc(id);
    const document = await ref.get();
    if (document.exists) {

        await ref.delete();

        return {};
    } else {
        throw new Error("publication not found");
    }
}