import { OPDSPublication } from "r2-opds-js/dist/es8-es2017/src/opds/opds2/opds2-publication";
import { IPublicationDb } from "../db/interface/publication.interface";
import { nanoid } from "nanoid";
import { publicationDb, publicationConverter } from "../db/publication";
import { publicationHrefFn, LINK_TYPE, algoliaEnabled } from "../constant";
import { OPDSLink } from "r2-opds-js/dist/es8-es2017/src/opds/opds2/opds2-link";
import { algoliaIndex } from "../utils/algolia";
import { TaJsonSerialize } from "r2-lcp-js/dist/es8-es2017/src/serializable";

const addSelfLink = (publication: OPDSPublication, pubId: string) => {
        publication.Links = publication.Links.reduce(
            (pv, cv) => cv?.HasRel("self") ? pv : [...pv, cv],
            new Array<OPDSLink>(),
        );
        const href = publicationHrefFn(pubId);
        // @ts-ignore 
        // bad type on functions, missing '?'
        publication.AddLink_(href, LINK_TYPE, "self");
}

export const savePublicationInDb = async (publication: OPDSPublication): Promise<IPublicationDb["publication"]> => {
    
    const pubId = publication.Metadata.Identifier = (nanoid() + "_" + (publication.Metadata.Identifier || "pubId"));

    addSelfLink(publication, pubId);

    const doc: IPublicationDb = {
        popularityCounter: 0,
        publication: publication,
        createTimestamp: Date.now(),
        modifiedTimestamp: Date.now(),
    };

    if (algoliaEnabled) {

        try {
            const algoliaObject = TaJsonSerialize(publication.Metadata);
            algoliaObject.objectID = publication.Metadata.Identifier;
            await algoliaIndex.saveObject(algoliaObject);
    
        } catch (e) {
            console.log("algolia save error", e);
            
        } 
    }

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
    const pubs = document.docs
        .map((v) => v.data()?.publication)
        .filter((v) => v) as OPDSPublication[];

    return pubs;
}

export const updatePublicationInDb = async (id: string, publication: OPDSPublication): Promise<IPublicationDb["publication"]> => {

    const ref = publicationDb.doc(id);
    const document = await ref.get();
    if (document.exists && document.data()) {
    
        const data = document.data() as IPublicationDb; // bad infer

        addSelfLink(publication, publication.Metadata.Identifier);

        if (algoliaEnabled) {

            try {
                const algoliaObject = TaJsonSerialize(publication.Metadata);
                algoliaObject.objectID = publication.Metadata.Identifier;
                await algoliaIndex.saveObject(algoliaObject);
    
            } catch (e) {
                console.log("algolia save error", e);
    
            }
        }

        const doc: IPublicationDb = {
            ...data,
            popularityCounter: typeof data.popularityCounter === "number" ? data.popularityCounter + 1 : 0,
            modifiedTimestamp: Date.now(),
            publication: publication,
        }

        // !
        // firestore update doesn't call publicationConverter
        await ref.update(publicationConverter.toFirestore(doc));

        return doc.publication;
    } else {
        throw new Error("publication not found");
    }
}

export const deletePublicationInDb = async (id: string) => {

    const ref = publicationDb.doc(id);
    const document = await ref.get();
    if (document.exists) {

        if (algoliaEnabled) {

            await algoliaIndex.deleteObject(id);
        }

        await ref.delete();

    } else {
        throw new Error("publication not found");
    }
}