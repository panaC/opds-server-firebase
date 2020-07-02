// import { addMessage } from './addMessage';
// import { webpubFonction } from './webpub';
import { https } from "firebase-functions";

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

import { initGlobalConverters_GENERIC, initGlobalConverters_SHARED } from "r2-shared-js/dist/es8-es2017/src/init-globals";

initGlobalConverters_GENERIC();
initGlobalConverters_SHARED();

import { webpubFonction } from "./webpub";
import { feedFn, sync } from "./feed";
import { addMessage} from "./addMessage";
import { publicationFonction } from "./publication";
import { storageFunction } from "./storage";
import { generateFonction } from "./generate";

const webpub = https.onRequest(webpubFonction);
const publication = https.onRequest(publicationFonction);
const feed = https.onRequest(feedFn);
const storage = https.onRequest(storageFunction);
const generate = https.onRequest(generateFonction);

export {
    sync,
    addMessage,
    webpub,
    publication,
    feed,
    storage,
    generate,
};
