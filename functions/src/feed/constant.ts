
import { config } from "firebase-functions";
import { URL } from "url";

const protocol = config().server.protocol;
const port = config().server.port;
const pathname = config().server.path;
const hostname = config().server.domain;
export const serverHref = new URL(protocol + "://" + hostname + ":" + port + "/" + pathname);

export const feedRoute = "/feed";

export const selfHref = new URL(feedRoute, serverHref);
export const selfHrefClone = () => new URL("", selfHref);

export const queryAllowed = {
    query: "query",
    title: "title",
    author: "author",
    subject: "subject",
    publisher: "publisher",
    language: "language",
    page: "page",
    number: "number",
    group: "group",
};

export const groupsAllowed = {
    mostRecent: "mostRecent",
    mostDownloaded: "mostDownloaded",
}

// TODO : handle templated url with {&}
export const searchHrefFn = (path: string) =>
    new URL(feedRoute + path, serverHref).toString() + "{?" + Object.keys(queryAllowed).join(',') + "}";

export const hrefFn = (path: string) =>
    new URL(feedRoute + path, serverHref).toString();

export const LINK_TYPE = 'application/opds+json';

export const isAGoodArray = (a: Array<any>) => {
    return Array.isArray(a) && !!a.length;
}

export const PUBLICATION_NUMBER_LIMIT = config().publicationLimit || 50;

