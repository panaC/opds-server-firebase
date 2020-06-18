import { db } from "../utils/db";
import { IWebpubDb } from "./interface/webpubDb.interface";

export const webpubDb = db.collection("publication") as FirebaseFirestore.CollectionReference<IWebpubDb>;