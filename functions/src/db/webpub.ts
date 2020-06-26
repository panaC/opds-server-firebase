import { db } from "./db";
import { IWebpubDb } from "./interface/webpub.interface";

export const webpubDb = db.collection("webpub") as FirebaseFirestore.CollectionReference<IWebpubDb>;