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
import { publicationFonction } from "./publication";
import { storeFunction } from "./store";
import { generateFonction } from "./generate";

const webpub = https.onRequest(webpubFonction);
const publication = https.onRequest(publicationFonction);
const feed = https.onRequest(feedFn);
const store = https.onRequest(storeFunction);
const generate = https.onRequest(generateFonction);

export {
    sync,
    webpub,
    publication,
    feed,
    store,
    generate,
};