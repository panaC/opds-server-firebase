import { addMessage } from './addMessage';
import { webpubFonction } from './webpub';
import { https } from "firebase-functions";

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

const webpub = https.onRequest(webpubFonction);

export {
    addMessage,
    webpub,
};
