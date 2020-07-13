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
import { response } from "./utils/response";
import { isAuthentified, setTokenInDb } from "./utils/auth";

const webpub = https.onRequest(webpubFonction);
const publication = https.onRequest(publicationFonction);
const feed = https.onRequest(feedFn);
const store = https.onRequest(storeFunction);
const generate = https.onRequest(generateFonction);


// basic authentification
const auth = https.onRequest(async (req, res) => {

    const send = response(res);

    try {

        if (req.method !== "POST") {
            return send(400, "not POST method");
        }

        const auth = await isAuthentified(req.headers.authorization);
        if (!auth) {
            return send(401, "not authentified");
        }
    
        const token = req.body["token"];
        
        if (token && typeof token === "string") {
            await setTokenInDb(token);
    
            return send(200, undefined, {
                token,
            });
        } else {
            return send(400, "not a valid token type in 'token' key, content-type should be application/x-www-form-urlencoded");
        }
    } catch (e) {

        console.log("error auth", e);
        return send(500, "token not updated", e);
    }

})

export {
    sync,
    webpub,
    publication,
    feed,
    store,
    generate,
    auth,
};