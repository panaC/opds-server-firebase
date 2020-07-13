
import { config } from "firebase-functions";
import { URL } from "url";

export const algoliaEnabled = config().algolia.enabled === "true" ? true : false;

const protocol = config().server.protocol;
const port = config().server.port;
const pathname = config().server.path;
const hostname = config().server.domain;

const portInUrl = (port === "80" || port === "443" || !port) ? "" : ":" + port;
export const serverHref = new URL(protocol + "://" + hostname + portInUrl + "/" + pathname);

export const feedRoute = "/feed";
export const publicationRoute = "/publication";
export const storeRoute = "/store";

export const defaultPageTitle = "feed";

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

export const queryPageTitle = "pagetitle";
export const queryQueryQMapping = "q";

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

export const storeHrefFn = (id: string) =>
    new URL(storeRoute + "/" + id, selfHref).toString();

export const LINK_TYPE = 'application/opds+json';

export const isAGoodArray = (a: any) => {
    return Array.isArray(a) && !!a.length;
}

export const PUBLICATION_NUMBER_LIMIT = config().publicationLimit || 50;

export const DEFAULT_TOKEN = "DEFAULT_TOKEN";