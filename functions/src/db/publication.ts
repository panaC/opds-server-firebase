import { db } from "./db";
import { IPublicationDb } from "./interface/publication.interface";
import { TaJsonSerialize, TaJsonDeserialize, JsonMap } from "r2-lcp-js/dist/es8-es2017/src/serializable";
import { OPDSPublication } from "r2-opds-js/dist/es8-es2017/src/opds/opds2/opds2-publication";
import { isAGoodArray } from "../constant";
import { IStringMap } from "r2-shared-js/dist/es8-es2017/src/models/metadata-multilang";

interface IPublicationMetadataDbInternal {
    metadataTitle: string[];
    metadataSubject: string[];
    metadataAuthor: string[];
    metadataLanguage: string[];
    metadataPublisher: string[];
}

interface IPublicationDbInternal extends
    Pick<IPublicationDb, "createTimestamp" | "modifiedTimestamp" | "popularityCounter">,
    IPublicationMetadataDbInternal {
    publication: JsonMap;
}

export const publicationConverter: FirebaseFirestore.FirestoreDataConverter<IPublicationDb> = {

    toFirestore: (obj): IPublicationDbInternal => {

        let title = new Array<string>();
        let subject = new Array<string>();
        let author = new Array<string>();
        let language = new Array<string>();
        let publisher = new Array<string>();

        const stringStringMapToArray = (value: string | IStringMap): string[] => {

            if (typeof value === "string") {
                return [value];
            } else if (typeof value === "object") {
                return Object.keys(value);
            }
            return [];
        }

        const metadata = obj?.publication?.Metadata;
        {
            const a = metadata?.Title;
            title = title.concat(stringStringMapToArray(a));
        }
        {
            const a = metadata?.Subject;
            if (isAGoodArray(a)) {
                for (let s of a) {
                    if (s.SortAs) {
                        subject.push(s.SortAs);
                    } else if (s.Name) {
                        subject = subject.concat(stringStringMapToArray(s.Name));
                    }
                    if (s.Code) {
                        subject.push(s.Code);
                    }
                }
            }
        }
        {
            const a = metadata?.Author;
            if (isAGoodArray(a)) {
                for (let c of a) {
                    if (c.SortAs) {
                        author.push(c.SortAs);
                    } else if (c.Name) {
                        author = author.concat(stringStringMapToArray(c.Name));
                    }
                    if (c.Identifier) {
                        author.push(c.Identifier);
                    }
                }
            }
        }
        {
            const a = metadata?.Language;
            if (isAGoodArray(a)) {
                language = language.concat(a);
            }
        }
        {
            const a = metadata?.Publisher;
            if (isAGoodArray(a)) {
                for (let c of a) {
                    if (c.SortAs) {
                        publisher.push(c.SortAs);
                    } else if (c.Name) {
                        publisher = publisher.concat(stringStringMapToArray(c.Name));
                    }
                    if (c.Identifier) {
                        publisher.push(c.Identifier);
                    }
                }
            }
        }

        return ({
            ...obj,

            metadataTitle: title,
            metadataSubject: subject,
            metadataAuthor: author,
            metadataLanguage: language,
            metadataPublisher: publisher,

            publication: TaJsonSerialize(obj.publication),
            modifiedTimestamp: Date.now(),
        });
    },

    fromFirestore: (obj: IPublicationDbInternal) => {

        let publication: OPDSPublication;
        try {
            publication = TaJsonDeserialize(obj.publication, OPDSPublication);
        } catch (e) {
            // console.log("the publication can't be deserialized", typeof obj.publication, obj);
            // on db.select

            // fallback to not set undefined publication in from and to
            publication = new OPDSPublication();
        }

        return ({
            publication,
            publicationNotParsed: obj.publication,
            modifiedTimestamp: obj.modifiedTimestamp,
            createTimestamp: obj.createTimestamp,
            popularityCounter: obj.popularityCounter,

            // used in distinct.ts
            metadataLanguage: obj.metadataLanguage || [],
            metadataSubject: obj.metadataSubject || [],
        });
    },
}

export const publicationDb = db
    .collection("publication")
    .withConverter(publicationConverter);