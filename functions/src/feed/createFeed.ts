
import { config } from "firebase-functions";
import { OPDSFeed } from "r2-opds-js/dist/es8-es2017/src/opds/opds2/opds2";
import { OPDSGroup } from "r2-opds-js/dist/es8-es2017/src/opds/opds2/opds2-group";
import { OPDSLink } from "r2-opds-js/dist/es8-es2017/src/opds/opds2/opds2-link";
import { OPDSMetadata } from "r2-opds-js/dist/es8-es2017/src/opds/opds2/opds2-metadata";
import { OPDSPublication } from "r2-opds-js/dist/es8-es2017/src/opds/opds2/opds2-publication";

import {
    groupsAllowed, feedHrefFn, isAGoodArray, LINK_TYPE, PUBLICATION_NUMBER_LIMIT, queryAllowed,
    feedSearchHrefFn, selfHref,
} from "../constant";
import { distinctLanguage, distinctSubject } from "./db/distinct";
import {
    getMostDownloadedPublicationFromDb, getMostRecentPublicationFromDb, getPromotePublicationFromDb,
    getSubjectPublicationFromDb,
} from "./db/select";
import { queryToPath } from "./service";
import { IParsedQuery } from "./query.type";
import { JsonMap } from "r2-lcp-js/dist/es8-es2017/src/serializable";

const createLink = (
    href: string, title?: string,
    typeLink: string = LINK_TYPE,
    rel: string = "self",
    templated: boolean = false,
) => {
    const l = new OPDSLink();
    l.Href = href;
    if (title) {
        l.Title = title;
    }
    if (rel) {
        l.AddRel(rel);
    }
    l.TypeLink = typeLink;
    if (templated) {
        l.Templated = true;
    }
    return l;
}

const createGroup = (
    pub: OPDSPublication[],
    ln: OPDSLink,
    ) => {
    const group = new OPDSGroup();
    group.Metadata = new OPDSMetadata();
    group.Metadata.Title = ln.Title;

    group.Publications = pub;

    group.Links = [];
    group.Links.push(ln);
    return group;
}

export const createFeed = async (
    publication: OPDSPublication[],
    query: IParsedQuery,
    title: string = config().server.name || "OPDS-SERVER",
): Promise<OPDSFeed> => {

    const opds = new OPDSFeed();

    opds.Metadata = new OPDSMetadata();
    opds.Metadata.Title = title;
    opds.Metadata.AdditionalJSON = {query: query as JsonMap};

    if (!publication) {
        opds.AddPagination(0, 0, 1, "", "", "", "");
    } else {
        let nextLink: string = "";
        let prevLink: string = "";
        let firstLink: string = "";
        let lastLink: string = "";

        const page = query.page || 1;
        const nbPages = Math.ceil(publication.length / PUBLICATION_NUMBER_LIMIT);

        if (page < nbPages) {
            nextLink = feedHrefFn(queryToPath(query, { [queryAllowed.page]: (page + 1).toString() }));
        }
        if (page + 1 < nbPages) {
            lastLink = feedHrefFn(queryToPath(query, { [queryAllowed.page]: (nbPages).toString() }));
        }
        if (page > 1) {
            prevLink = feedHrefFn(queryToPath(query, { [queryAllowed.page]: (page - 1).toString() }));
        }
        if (page - 1 > 1) {
            firstLink = feedHrefFn(queryToPath(query, { [queryAllowed.page]: "0" }));
        }
        opds.AddPagination(
            publication.length,
            publication.length < PUBLICATION_NUMBER_LIMIT ? publication.length : PUBLICATION_NUMBER_LIMIT,
            page,
            nextLink,
            prevLink,
            firstLink,
            lastLink,
        );

    }

    opds.AddLink(feedHrefFn(queryToPath(query)), "self", LINK_TYPE, false);
    opds.AddLink(feedSearchHrefFn(queryToPath(query)), "search", LINK_TYPE, true);

    opds.AddNavigation("HOME", selfHref.toString(), "self", LINK_TYPE);
    opds.AddNavigation("All publications", feedHrefFn(queryToPath(query, { [queryAllowed.number]: "*" })), "", LINK_TYPE);
    opds.AddNavigation("Are you curious ?", feedHrefFn(queryToPath(query, { [queryAllowed.number]: "10" })), "", LINK_TYPE);

    try {
        if (!query.language) {
            const languages = await distinctLanguage();
            languages.forEach((lang) => {
    
                const ln = createLink(feedHrefFn(queryToPath(query, { [queryAllowed.language]: lang })), lang);
                opds.AddFacet(ln, lang);
            });
        }
    } catch (e) {
        console.log("error to create language facet in home feed");
    }

    try {
        if (!query.subject) {
            const subjects = await distinctSubject();
            for await (const sub of subjects) {
    
                const subjectPub = await getSubjectPublicationFromDb(sub);
                if (isAGoodArray(subjectPub)) {
                    const ln = createLink(feedHrefFn(queryToPath(query, { [queryAllowed.subject]: sub })), sub);
                    opds.AddFacet(ln, sub);
                }
            }
        }
    } catch (e) {
        console.log("error to create subject facet in home feed");
    }

    if (!publication) {
        opds.Publications = [];
    } else {
        opds.Publications = publication;
    }

    return opds;
};

export const createHomeFeed = async (
    title: string = config().server.name || "OPDS-SERVER",
) => {

    const opds = new OPDSFeed();

    opds.Metadata = new OPDSMetadata();
    opds.Metadata.Title = title;

    opds.AddLink(selfHref.toString(), "self", LINK_TYPE, false);
    opds.AddLink(feedSearchHrefFn(""), "search", LINK_TYPE, true);

    opds.AddNavigation("All publications", feedHrefFn(queryToPath({ [queryAllowed.number]: "*" })), "", LINK_TYPE);
    opds.AddNavigation("Are you curious ?", feedHrefFn(queryToPath({ [queryAllowed.number]: "10" })), "self", LINK_TYPE);


    try {
        const languages = await distinctLanguage();
        languages.forEach((lang) => {
    
            const ln = createLink(feedHrefFn(queryToPath({ [queryAllowed.language]: lang })), lang);
            opds.AddFacet(ln, lang);
        });
    } catch (e) {
        console.log("error to create language facets in homefeed", e);
    }

    opds.Groups = new Array<OPDSGroup>();
    try {
            const mostRecent = await getMostRecentPublicationFromDb();
            if (isAGoodArray(mostRecent)) {
                const ln = createLink(feedHrefFn(queryToPath({ [queryAllowed.group]: groupsAllowed.mostRecent })), groupsAllowed.mostRecent);
                opds.Groups.push(createGroup(mostRecent, ln));
            }
    } catch (e) {
        console.log("error to create mostRecent group in home feed", e);
    }
    try {
        const mostDown = await getMostDownloadedPublicationFromDb();
        if (isAGoodArray(mostDown)) {
            const ln = createLink(feedHrefFn(queryToPath({ [queryAllowed.group]: groupsAllowed.mostDownloaded })), groupsAllowed.mostDownloaded);
            opds.Groups.push(createGroup(mostDown, ln));
        }
    } catch (e) {
        console.log("error to create mostDownloaded group in home feed", e);
    }
    try {
        const subjects = await distinctSubject();
        for await (const sub of subjects) {

            const subjectPub = await getSubjectPublicationFromDb(sub);
            if (isAGoodArray(subjectPub)) {
                const ln = createLink(feedHrefFn(queryToPath({ [queryAllowed.subject]: sub })), sub);
                opds.Groups.push(createGroup(subjectPub, ln));
            }
        }
    } catch (e) {
        console.log("error to create subject group in home feed", e);
        
    }

    const promote = await getPromotePublicationFromDb();
    if (isAGoodArray(promote)) {
        opds.Publications = promote;
    }

    return opds;
}