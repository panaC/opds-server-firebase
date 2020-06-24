// import { addMessage } from './addMessage';
// import { webpubFonction } from './webpub';
import { https } from "firebase-functions";

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

import { initGlobalConverters_GENERIC, initGlobalConverters_SHARED } from "r2-shared-js/dist/es8-es2017/src/init-globals";

initGlobalConverters_GENERIC();
initGlobalConverters_SHARED();

import { webpubFonction } from "./webpub";
import { feedFn } from "./feed";
import { addMessage} from "./addMessage";

const webpub = https.onRequest(webpubFonction);
const feed = https.onRequest(feedFn);

export {
    addMessage,
    webpub,
    feed,
};
