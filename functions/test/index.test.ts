
import { Publication as R2Publication } from "r2-shared-js/dist/es8-es2017/src/models/publication";
// import * as functions from "firebase-functions";
import * as testFactory from 'firebase-functions-test';
import * as chai from "chai";
const assert = chai.assert;

import * as config from "../config.json"; 
const test = testFactory(config["FIREBASE_CONFIG"], config["GOOGLE_APPLICATION_CREDENTIALS"]);
// const projectConfig = config["FIREBASE_CONFIG"];

import * as admin from 'firebase-admin';
import { HttpsFunction } from 'firebase-functions';
import { exit } from 'process';
import { JSON as TAJSON } from "ta-json-x";
import { TaJsonDeserialize } from "r2-lcp-js/dist/es8-es2017/src/serializable";

describe("functions", () => {

  let myFonctions: { webpub: HttpsFunction };
  before(() => {
    // Require index.js and save the exports inside a namespace called myFunctions.
    // This includes our cloud functions, which can now be accessed at myFunctions.makeUppercase
    // and myFunctions.addMessage
    myFonctions = require('../src/index');
  });

  after(() => {
    // Do cleanup tasks.
    test.cleanup();
    // Reset the database.
    admin.firestore().collection('publication').get().then((v) => Promise.all(v.docs.map((d) => admin.firestore().collection('publication').doc(d.id).delete())).then(() => exit()));
  });

  describe("post", () => {

    const publication = {
      "@context": "https://readium.org/webpub-manifest/context.jsonld",
      
      "metadata": {
        "@type": "http://schema.org/Book",
        "title": "Moby-Dick",
        "author": "Herman Melville",
        "identifier": "urn:isbn:978031600000X",
        "language": "en",
        "modified": "2015-09-29T17:00:00Z"
      },
    
      "links": [
        {"rel": "self", "href": "https://example.com/manifest.json", "type": "application/webpub+json"},
        {"rel": "alternate", "href": "https://example.com/publication.epub", "type": "application/epub+zip"},
        {"rel": "search", "href": "https://example.com/search{?query}", "type": "text/html", "templated": true}
      ],
      
      "readingOrder": [
        {"href": "https://example.com/c001.html", "type": "text/html", "title": "Chapter 1"}, 
        {"href": "https://example.com/c002.html", "type": "text/html", "title": "Chapter 2"}
      ],
    
      "resources": [
        {"rel": "cover", "href": "https://example.com/cover.jpg", "type": "image/jpeg", "height": 600, "width": 400},
        {"href": "https://example.com/style.css", "type": "text/css"}, 
        {"href": "https://example.com/whale.jpg", "type": "image/jpeg"}, 
        {"href": "https://example.com/boat.svg", "type": "image/svg+xml"}, 
        {"href": "https://example.com/notes.html", "type": "text/html"}
      ]
    };

    it("test", async () => {

      let status;
      let body: string = "{}";
      // A fake request object, with req.query.text set to 'input'
      const req: any = { body: { publication: TAJSON.stringify(publication) }, method: "POST"};
      // A fake response object, with a stubbed redirect function which does some assertions
      const res: any = {
        status: (code: number) => {
          console.log("code", code);
          status = code;
          return res;
        },
        send: (_body: any) => {
          console.log("body", _body);
          body = _body;
          return res;
        }
      };
      
      await myFonctions.webpub(req, res);
      assert.equal(status, 200);
      assert.deepEqual(TAJSON.parse(body, R2Publication), TaJsonDeserialize(publication, R2Publication));

    });

  });

});
