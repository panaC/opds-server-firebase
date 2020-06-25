import { db } from "./db";
import { IWebpubDb } from "./interface/webpub.interface";

export const webpubDb = db.collection("publication") as FirebaseFirestore.CollectionReference<IWebpubDb>;