import { db } from "./db";
import { IFeedDoc } from "./interface/feed.interface";

export const feedDoc = db.collection("feed").doc("feed") as FirebaseFirestore.DocumentReference<IFeedDoc>