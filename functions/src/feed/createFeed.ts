
import { config } from "firebase-functions";
import { JsonMap } from "r2-lcp-js/dist/es8-es2017/src/serializable";
import { OPDSFeed } from "r2-opds-js/dist/es8-es2017/src/opds/opds2/opds2";
import { OPDSGroup } from "r2-opds-js/dist/es8-es2017/src/opds/opds2/opds2-group";
import { OPDSLink } from "r2-opds-js/dist/es8-es2017/src/opds/opds2/opds2-link";
import { OPDSMetadata } from "r2-opds-js/dist/es8-es2017/src/opds/opds2/opds2-metadata";
import { OPDSPublication } from "r2-opds-js/dist/es8-es2017/src/opds/opds2/opds2-publication";

import {
    feedHrefFn, feedSearchHrefFn, groupsAllowed, isAGoodArray, LINK_TYPE, queryAllowed,
    queryPageTitle, selfHref,
} from "../constant";
import { distinctLanguage, distinctSubject } from "./db/distinct";
import {
    getMostDownloadedPublicationFromDb, getMostRecentPublicationFromDb, getPromotePublicationFromDb,
    getSubjectPublicationFromDb,
} from "./db/select";
import { IParsedQuery } from "./query.type";
import { queryToPath } from "./service";

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
    nbPublication: number,
    limit: number,
    title: string = config().server.name || "OPDS-SERVER",
): Promise<OPDSFeed> => {

    const opds = new OPDSFeed();

    opds.Metadata = new OPDSMetadata();
    opds.Metadata.Title = title;
    opds.Metadata.AdditionalJSON = { query: query as JsonMap };

    if (!publication) {
        opds.AddPagination(0, 0, 1, "", "", "", "");

    } else {

        let nextLink: string = "";
        let prevLink: string = "";
        let firstLink: string = "";
        let lastLink: string = "";

        const page = query.page || 1;
        const nbPages = Math.ceil(nbPublication / limit);

        if (page < nbPages) {
            nextLink = feedHrefFn(
                queryToPath(
                    query,
                    {
                        [queryAllowed.page]: (page + 1).toString(),
                    },
                )
            );
        }
        if (page + 1 < nbPages) {
            lastLink = feedHrefFn(
                queryToPath(
                    query,
                    {
                        [queryAllowed.page]: (nbPages).toString(),
                    },
                )
            );
        }
        if (page > 1) {
            prevLink = feedHrefFn(
                queryToPath(
                    query,
                    {
                        [queryAllowed.page]: (page - 1).toString(),
                    },
                )
            );
        }
        if (page - 1 > 1) {
            firstLink = feedHrefFn(
                queryToPath(
                    query,
                    {
                        [queryAllowed.page]: "1",
                    },
                )
            );
        }
        opds.AddPagination(
            nbPublication,
            nbPublication < limit ? nbPublication : limit,
            page,
            nextLink,
            prevLink,
            firstLink,
            lastLink,
        );

    }

    {
        const href = feedHrefFn(
            queryToPath(
                query
            )
        );
        opds.AddLink(href, "self", LINK_TYPE, false);
    }
    {
        const href = feedSearchHrefFn(
            queryToPath(
                query,
                {
                    [queryPageTitle]: "",
                }
            )
        );
        opds.AddLink(href, "search", LINK_TYPE, true);
    }

    opds.AddNavigation("HOME", selfHref.toString(), "self", LINK_TYPE);

    {
        const title = "All publication";
        const href = feedHrefFn(
            queryToPath(
                query,
                {
                    [queryAllowed.number]: "*",
                    [queryPageTitle]: title,
                },
            )
        );

        opds.AddNavigation(title, href, "", LINK_TYPE);
    }
    {
        const title = "Are you curious ?";
        const href = feedHrefFn(
            queryToPath(
                query,
                {
                    [queryAllowed.number]: "10",
                    [queryPageTitle]: title,
                },
            )
        );

        opds.AddNavigation(title, href, "", LINK_TYPE);
    };

    try {
        if (!query.language) {
            const languages = await distinctLanguage();
            languages.forEach((lang) => {

                const href = feedHrefFn(
                    queryToPath(
                        query,
                        {
                            [queryAllowed.language]: lang,
                            [queryPageTitle]: lang,
                        },
                    )
                );

                const ln = createLink(href, lang);
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

                    const href = feedHrefFn(
                        queryToPath(
                            query,
                            {
                                [queryAllowed.group]: groupsAllowed.mostDownloaded,
                                [queryPageTitle]: groupsAllowed.mostDownloaded,
                            },
                        )
                    );
                    const ln = createLink(href, sub);
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

    {
        const title = "All publication";
        const href = feedHrefFn(
            queryToPath(
                {
                    [queryAllowed.number]: "*",
                    [queryPageTitle]: title,
                },
            )
        );

        opds.AddNavigation(title, href, "", LINK_TYPE);
    }
    {
        const title = "Are you curious ?";
        const href = feedHrefFn(
            queryToPath(
                {
                    [queryAllowed.number]: "10",
                    [queryPageTitle]: title,
                },
            )
        );

        opds.AddNavigation(title, href, "", LINK_TYPE);
    }

    try {
        const languages = await distinctLanguage();
        languages.forEach((lang) => {

            const href = feedHrefFn(
                queryToPath(
                    {
                        [queryAllowed.language]: lang,
                        [queryPageTitle]: lang,
                    },
                )
            );
            const ln = createLink(href, lang);
            opds.AddFacet(ln, lang);
        });
    } catch (e) {
        console.log("error to create language facets in homefeed", e);
    }

    opds.Groups = new Array<OPDSGroup>();
    try {
        const mostRecent = await getMostRecentPublicationFromDb();
        if (isAGoodArray(mostRecent)) {

            const href = feedHrefFn(
                queryToPath(
                    {
                        [queryAllowed.group]: groupsAllowed.mostRecent,
                        [queryPageTitle]: groupsAllowed.mostRecent,
                    },
                )
            );
            const ln = createLink(href, groupsAllowed.mostRecent);
            opds.Groups.push(createGroup(mostRecent, ln));
        }

    } catch (e) {

        console.log("error to create mostRecent group in home feed", e);
    }

    try {
        const mostDown = await getMostDownloadedPublicationFromDb();
        if (isAGoodArray(mostDown)) {

            const href = feedHrefFn(
                queryToPath(
                    {
                        [queryAllowed.group]: groupsAllowed.mostDownloaded,
                        [queryPageTitle]: groupsAllowed.mostDownloaded,
                    },
                )
            );
            const ln = createLink(href, groupsAllowed.mostDownloaded);
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

                const href = feedHrefFn(
                    queryToPath(
                        {
                            [queryAllowed.subject]: sub,
                            [queryPageTitle]: sub,
                        },
                    )
                );
                const ln = createLink(href, sub);
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