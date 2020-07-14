import { Publication as R2Publication } from "r2-shared-js/dist/es8-es2017/src/models/publication";
import { webpubDb } from "../db/webpub";
import { IWebpubDb } from "../db/interface/webpub.interface";
import { nanoid } from "nanoid";
import { webpubConverter } from "../db/webpub"

export const savePublicationInDb = async (publication: R2Publication): Promise<IWebpubDb["publication"]> => {
    
    const pubId = publication.Metadata.Identifier = (nanoid() + "_" + (publication.Metadata.Identifier || "pubId"));

    const doc: IWebpubDb = {
        popularityCounter: 0,
        publication: publication,
        createTimestamp: Date.now(),
        modifiedTimestamp: Date.now(),
    };
    
    const document = await webpubDb.doc(pubId).get();
    if (document.exists) {
        throw new Error("webpub already exists");
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
        throw new Error("webpub not found");
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

        publication.Metadata.Identifier = id;

        const data = document.data() as IWebpubDb; // bad infer
        const doc: IWebpubDb = {
            ...data,
            popularityCounter: typeof data.popularityCounter === "number" ? data.popularityCounter + 1 : 0,
            modifiedTimestamp: Date.now(),
            publication: publication,
        }

        await ref.update(webpubConverter.toFirestore(doc));

        return doc.publication;
    } else {
        throw new Error("webpub not found");
    }
}

export const deletePublicationInDb = async (id: string) => {

    const ref = webpubDb.doc(id);
    const document = await ref.get();
    if (document.exists) {

        await ref.delete();

    } else {
        throw new Error("webpub not found");
    }
}