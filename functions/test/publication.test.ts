
import "mocha";

import chai from "chai";
// const projectConfig = config["FIREBASE_CONFIG"];
// import * as admin from 'firebase-admin';
import { HttpsFunction } from "firebase-functions";
// import * as functions from "firebase-functions";
import testFactory from "firebase-functions-test";
// import { exit } from "process";
import { TaJsonDeserialize } from "r2-lcp-js/dist/es8-es2017/src/serializable";
import { JSON as TAJSON } from "ta-json-x";

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
    const req: any = { body: { publication: TAJSON.stringify(publication) }, method: "POST" };
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

    it("run POST", async () => {

      await myFonctions.publication(req, res);
    });

    it("code 200", () => {
      assert.equal(status, 200);
    });

    it("body returns publication", () => {
      assert.deepEqual(normalize(body), normalize(publication));
    });

    it("publication in DB", async () => {

      const dataFromDb = await (await db.doc(publication.metadata.identifier).get()).data()?.publication;

      assert.deepEqual(dataFromDb, normalize(publication));

    });

  });

  describe("GET", () => {

    let status: number;
    let body: string = "{}";
    // A fake request object, with req.query.text set to 'input'
    const req: any = { query: { id: publication.metadata.identifier }, method: "GET" };
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

    it("run GET", async () => {

      await myFonctions.publication(req, res);
    });

    it("code 200", () => {
      assert.equal(status, 200);
    });

    it("body returns publication", () => {
      assert.deepEqual(normalize(body), normalize(publication));
    });

  });

  describe("UPDATE", () => {

    let status: number;
    let body: string = "{}";
    // A fake request object, with req.query.text set to 'input'
    const req: any = { query: { id: publication.metadata.identifier }, body: { publication: TAJSON.stringify(publication) }, method: "PUT" };
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

    it("run UPDATE", async () => {

      await myFonctions.publication(req, res);
    });

    it("code 200", () => {
      assert.equal(status, 200);
    });

    it("body returns publication", () => {
      assert.deepEqual(normalize(body), normalize(publication));
    });

    it("publication in DB", async () => {

      const dataFromDb = await (await db.doc(publication.metadata.identifier).get()).data()?.publication;
      assert.deepEqual(dataFromDb, normalize(publication));

    });

  });

  describe("DELETE", () => {

    let status: number;
    let body: string = "{}";
    // A fake request object, with req.query.text set to 'input'
    const req: any = { query: { id: publication.metadata.identifier }, method: "DELETE" };
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

    it("run DELETE", async () => {

      await myFonctions.publication(req, res);
    });

    it("code 200", () => {
      assert.equal(status, 200);
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
