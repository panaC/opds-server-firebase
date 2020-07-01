
import { config } from "firebase-functions";
import { URL } from "url";

export const algoliaEnabled = config().algolia.enabled === "true" ? true : false;

const protocol = config().server.protocol;
const port = config().server.port;
const pathname = config().server.path;
const hostname = config().server.domain;
export const serverHref = new URL(protocol + "://" + hostname + ":" + port + "/" + pathname);

export const feedRoute = "/feed";
export const publicationRoute = "/publication";

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
export const feedSearchHrefFn = (path: string) =>
    new URL(feedRoute + path, serverHref).toString() + "{?" + Object.keys(queryAllowed).join(',') + "}";

export const feedHrefFn = (path: string) =>
    new URL(feedRoute + path, serverHref).toString();

export const publicationHrefFn = (id: string) => {
    const u = new URL(publicationRoute, serverHref);

    u.searchParams.append("id", encodeURI(id));

    return u.toString();
}

export const LINK_TYPE = 'application/opds+json';

export const isAGoodArray = (a: any) => {
    return Array.isArray(a) && !!a.length;
}

export const PUBLICATION_NUMBER_LIMIT = config().publicationLimit || 50;

