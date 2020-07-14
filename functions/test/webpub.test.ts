
import "mocha";

import chai from "chai";
// const projectConfig = config["FIREBASE_CONFIG"];
// import * as admin from 'firebase-admin';
import { HttpsFunction } from "firebase-functions";
// import * as functions from "firebase-functions";
import testFactory from "firebase-functions-test";
// import { exit } from "process";
import { TaJsonDeserialize } from "r2-lcp-js/dist/es8-es2017/src/serializable";
import { Publication as R2Publication } from "r2-shared-js/dist/es8-es2017/src/models/publication";

import { IWebpubDb } from "../src/db/interface/webpub.interface";
import { webpubDb } from "../src/db/webpub";
import * as config from "./config.json";

const assert = chai.assert;

export const normalize = (o: any) => TaJsonDeserialize(o, R2Publication);

const test = testFactory(config["FIREBASE_CONFIG"], config["GOOGLE_APPLICATION_CREDENTIALS"]);
let db: FirebaseFirestore.CollectionReference<IWebpubDb>;
const webpub = {
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
    { "rel": "self", "href": "https://example.com/manifest.json", "type": "application/webpub+json" },
    { "rel": "alternate", "href": "https://example.com/publication.epub", "type": "application/epub+zip" },
    { "rel": "search", "href": "https://example.com/search{?query}", "type": "text/html", "templated": true }
  ],

  "readingOrder": [
    { "href": "https://example.com/c001.html", "type": "text/html", "title": "Chapter 1" },
    { "href": "https://example.com/c002.html", "type": "text/html", "title": "Chapter 2" }
  ],

  "resources": [
    { "rel": "cover", "href": "https://example.com/cover.jpg", "type": "image/jpeg", "height": 600, "width": 400 },
    { "href": "https://example.com/style.css", "type": "text/css" },
    { "href": "https://example.com/whale.jpg", "type": "image/jpeg" },
    { "href": "https://example.com/boat.svg", "type": "image/svg+xml" },
    { "href": "https://example.com/notes.html", "type": "text/html" }
  ]
};

describe("/webpub functions", () => {

  let myFonctions: { webpub: HttpsFunction };
  let pubId: string;
  let pub: any;
  before(() => {
    // Require index.js and save the exports inside a namespace called myFunctions.
    // This includes our cloud functions, which can now be accessed at myFunctions.makeUppercase
    // and myFunctions.addMessage
    myFonctions = require('../src/index');

    db = webpubDb;
  });

  after(() => {
    // Do cleanup tasks.
    test.cleanup();
    // Reset the database.
    // db.get().then((v) => Promise.all(v.docs.map((d) => db.doc(d.id).delete())).then(() => exit()));
  });

  describe("POST", () => {

    let status: number;
    let body: any;
    // A fake request object, with req.query.text set to 'input'
    const req: any = { body: webpub, method: "POST", headers: { authorization: "Bearer DEFAULT_TOKEN" } };
    // A fake response object, with a stubbed redirect function which does some assertions
    const res: any = {
      set: (...arg: any) => {
        // console.log("set", ...arg);
        return res;
      },
      status: (code: number) => {
        // console.log("code", code);
        status = code;
        return res;
      },
      json: (_body: any) => {
        // console.log("body", _body);
        body = _body;
        pub = body;
        return res;
      }
    };

    it("run POST", async () => {

      await myFonctions.webpub(req, res);
    });

    it("code 201", () => {
      assert.equal(status, 201);
    });

    it("body returns publication", () => {

      // console.log("BODY", body, body.metadata, body.metadata.identifier);

      try {
        pubId = body.metadata.identifier;
      } catch (e) {

        console.log("#######");
        console.log("#######");
        console.log("#######");
        console.log("#######");

        console.log(e);
        
        console.log("#######");
        console.log("#######");
        console.log("#######");
        
      }
      
      assert.deepEqual(body.readingOrder, webpub.readingOrder);
    });

    it("publication in DB", async () => {

      const dataFromDb = await (await db.doc(pubId).get()).data()?.publication;

      assert.deepEqual(normalize(body), dataFromDb);

    });

  });

  describe("GET", () => {

    let status: number;
    let body: string = "{}";
    
    it("run GET", async () => {
      // A fake request object, with req.query.text set to 'input'
      const req: any = { path: "/" + pubId, method: "GET" };;
      // A fake response object, with a stubbed redirect function which does some assertions
      const res: any = {
        set: (...arg: any) => {
          // console.log("set", ...arg);
          return res;
        },
        status: (code: number) => {
          // console.log("code", code);
          status = code;
          return res;
        },
        json: (_body: any) => {
          // console.log("body", _body);
          body = _body;
          return res;
        }
      };

      await myFonctions.webpub(req, res);
    });

    it("code 200", () => {
      assert.equal(status, 200);
    });

    it("body returns publication", () => {
      assert.deepEqual(body, pub);
    });

  });

  describe("UPDATE", () => {

    let status: number;
    let body: string = "{}";
    
    it("run UPDATE", async () => {
      // A fake request object, with req.query.text set to 'input'
      const req: any = { path: "/" + pubId, body: webpub, method: "PUT", headers: { authorization: "Bearer DEFAULT_TOKEN"} };
      // A fake response object, with a stubbed redirect function which does some assertions
      const res: any = {
        set: (...arg: any) => {
          // console.log("set", ...arg);
          return res;
        },
        status: (code: number) => {
          // console.log("code", code);
          status = code;
          return res;
        },
        json: (_body: any) => {
          // console.log("body", _body);
          body = _body;
          return res;
        }
      };

      await myFonctions.webpub(req, res);
    });

    it("code 201", () => {
      assert.equal(status, 201);
    });

    it("body returns publication", () => {
      assert.deepEqual(body, pub);
    });

    it("publication in DB", async () => {

      const dataFromDb = await (await db.doc(pubId).get()).data()?.publication;
      assert.deepEqual(dataFromDb, normalize(body));

    });

  });

  describe("DELETE", () => {

    let status: number;
    let body: string = "{}";
    
    it("run DELETE", async () => {
      // A fake request object, with req.query.text set to 'input'
      const req: any = { path: "/" + pubId, headers: { authorization: "Bearer DEFAULT_TOKEN" }, method: "DELETE" };
      // A fake response object, with a stubbed redirect function which does some assertions
      const res: any = {
        set: (...arg: any) => {
          // console.log("set", ...arg);
          return res;
        },
        status: (code: number) => {
          // console.log("code", code);
          status = code;
          return res;
        },
        json: (_body: any) => {
          // console.log("body", _body);
          body = _body;
          return res;
        }
      };

      await myFonctions.webpub(req, res);
    });

    it("code 204", () => {
      assert.equal(status, 204);
    });

    it("body returns publication", () => {
      assert.deepEqual(body, undefined);
    });

    it("publication in DB", async () => {

      const dataFromDb = await (await db.doc(pubId).get()).data()?.publication;
      assert.equal(dataFromDb, undefined);

    });

  });

});
