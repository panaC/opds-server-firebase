import { db } from "./db";
import { IPublicationDb } from "./interface/publication.interface";

export const publicationDb = db.collection("publication") as FirebaseFirestore.CollectionReference<IPublicationDb>;