import { db } from "./db";
import { IFeedDoc } from "./interface/feed.interface";

export const feedDoc = db.doc("feed") as FirebaseFirestore.DocumentReference<IFeedDoc>