
import "mocha";

import chai from "chai";
// const projectConfig = config["FIREBASE_CONFIG"];
// import * as admin from 'firebase-admin';
import { HttpsFunction } from "firebase-functions";
// import * as functions from "firebase-functions";
import testFactory from "firebase-functions-test";
// import { exit } from "process";
import { TaJsonDeserialize } from "r2-lcp-js/dist/es8-es2017/src/serializable";

import * as config from "./config.json";
import { OPDSPublication } from "r2-opds-js/dist/es8-es2017/src/opds/opds2/opds2-publication";
import { publicationDb } from "../src/db/publication";
import { IPublicationDb } from "../src/db/interface/publication.interface";

const assert = chai.assert;

export const normalize = (o: any) => TaJsonDeserialize(o, OPDSPublication);

const test = testFactory(config["FIREBASE_CONFIG"], config["GOOGLE_APPLICATION_CREDENTIALS"]);
let db: FirebaseFirestore.CollectionReference<IPublicationDb>;

const publication = {
  "metadata": {
    "@type": "http://schema.org/Book",
    "title": "Moby-Dick",
    "author": "Herman Melville",
    "identifier": "urn:isbn:978031600000X",
    "language": "en",
    "modified": "2015-09-29T17:00:00Z"
  },
  "links": [
    {"rel": "self", "href": "http://example.org/manifest.json", "type": "application/webpub+json"}
  ],
  "images": [
    {"href": "http://example.org/cover.jpg", "type": "image/jpeg", "height": 1400, "width": 800},
    {"href": "http://example.org/cover-small.jpg", "type": "image/jpeg", "height": 700, "width": 400},
    {"href": "http://example.org/cover.svg", "type": "image/svg+xml"}
  ]
}

describe("/publication functions", () => {

  let myFonctions: { publication: HttpsFunction };
  let pubId: string;
  let pub: any;
  before(() => {
    // Require index.js and save the exports inside a namespace called myFunctions.
    // This includes our cloud functions, which can now be accessed at myFunctions.makeUppercase
    // and myFunctions.addMessage
    myFonctions = require('../src/index');

    db = publicationDb;
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
    const req: any = { body: publication, method: "POST", headers: { authorization: "Bearer DEFAULT_TOKEN"} };
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

      await myFonctions.publication(req, res);
    });

    it("code 200", () => {
      assert.equal(status, 201);

    });
    
    it("body returns publication", () => {
      pubId = body.metadata.identifier
      assert.deepEqual(body.images, publication.images);
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
      console.log("pubId", pubId);
  
      // A fake request object, with req.query.text set to 'input'
      const req: any = { path: "/" + pubId, method: "GET" };
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

      await myFonctions.publication(req, res);
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
      const req: any = { path: "/" + pubId, body: publication, method: "PUT", headers: { authorization: "Bearer DEFAULT_TOKEN"} };
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

      await myFonctions.publication(req, res);
    });

    it("code 201", () => {

      assert.equal(status, 201);
    });

    it("body returns publication", () => {
      assert.deepEqual(body, pub);
    });

    it("publication in DB", async () => {

      const dataFromDb = await (await db.doc(pubId).get()).data()?.publication;
      assert.deepEqual(normalize(body), dataFromDb);

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

      await myFonctions.publication(req, res);
    });

    it("code 204", () => {
      assert.equal(status, 204);
    });

    it("body returns publication", () => {
      assert.deepEqual(body, undefined);
    });

    it("publication in DB", async () => {

      const dataFromDb = await (await db.doc(publication.metadata.identifier).get()).data()?.publication;
      assert.equal(dataFromDb, undefined);

    });

  });

});
