import { admin } from "../utils/admin";

export const db = admin.firestore();

db.runTransaction