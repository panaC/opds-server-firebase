import { addMessage } from './addMessage';
import { webpubFonction } from './webpub';

// The Firebase Admin SDK to access Cloud Firestore.
import * as admin from 'firebase-admin';
admin.initializeApp();

import { https } from "firebase-functions";

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

const webpub = https.onRequest(webpubFonction);

export {
    addMessage,
    webpub,
};
