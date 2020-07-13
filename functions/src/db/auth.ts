import { db } from "./db";
import { IAuthDb } from "./interface/auth.interface";

export const authDb = db
    .collection("auth").doc("token") as FirebaseFirestore.DocumentReference<IAuthDb>;