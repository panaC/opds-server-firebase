
import { config } from "firebase-functions";
import { URL } from "url";

const protocol = config().server.protocol;
const port = config().server.port;
const pathname = config().server.path;
const hostname = config().server.domain;
export const serverHref = new URL(protocol + "://" + hostname + ":" + port + "/" + pathname);

export const selfHref = new URL("/feed", serverHref);
export const selfHrefClone = () => new URL("", selfHref);

export const LINK_TYPE = 'application/opds+json';