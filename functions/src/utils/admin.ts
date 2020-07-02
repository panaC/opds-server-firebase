
// The Firebase Admin SDK to access Cloud Firestore.
import * as admin from 'firebase-admin';

const adminConfig = JSON.parse(process.env.FIREBASE_CONFIG || "{}");
const serviceAccount = require("../../serviceAccountKey.json");

adminConfig.credential = admin.credential.cert(serviceAccount);
adminConfig.storageBucket = adminConfig.projectId + ".appspot.com";

admin.initializeApp(adminConfig);

export {
    admin,
}