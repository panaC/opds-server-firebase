
import { config } from "firebase-functions";
import { OPDSFeed } from "r2-opds-js/dist/es8-es2017/src/opds/opds2/opds2";
import { OPDSMetadata } from "r2-opds-js/dist/es8-es2017/src/opds/opds2/opds2-metadata";
import { OPDSLink } from "r2-opds-js/dist/es8-es2017/src/opds/opds2/opds2-link";
import { OPDSPublication } from "r2-opds-js/dist/es8-es2017/src/opds/opds2/opds2-publication";
import { OPDSGroup } from "r2-opds-js/dist/es8-es2017/src/opds/opds2/opds2-group";
import { LINK_TYPE, selfHref, searchHrefFn, query, groups, hrefFn, isAGoodArray } from "./constant";
import { distinctLanguage, distinctSubject } from "./db/distinct";
import { URL } from "url";
import { getMostRecentPublicationFromDb, getMostDownloadedPublicationFromDb, getSubjectPublicationFromDb, getPromotePublicationFromDb } from "./db/select";

const createLink = (href: string, title?: string, typeLink: string = LINK_TYPE, rel: string = "self", templated: boolean = false) => {
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

const createGroup = (pub: OPDSPublication[], ln: OPDSLink) => {
    const group = new OPDSGroup();
    group.Metadata = new OPDSMetadata();
    group.Metadata.Title = ln.Title;

    group.Publications = pub;

    group.Links = [];
    group.Links.push(ln);
    return group;
}

export const createFeed = async (): Promise<OPDSFeed> => {

    const opds = new OPDSFeed();

    opds.Metadata = new OPDSMetadata();
    opds.Metadata.Title = config().server.name || "OPDS-SERVER";

    opds.AddLink(selfHref.toString(), "self", LINK_TYPE, false);
    opds.AddLink(searchHrefFn(""), "search", LINK_TYPE, true);

    opds.AddNavigation("All publications", new URL("/" + query.number + "/*", selfHref).toString(), "", LINK_TYPE);
    opds.AddNavigation("Are you curious ?", new URL("/" + query.number + "/10", selfHref).toString(), "", LINK_TYPE);

    {
        const languages = await distinctLanguage();
        languages.forEach((lang) => {

            const ln = createLink(new URL("/" + query.language + "/" + lang, selfHref).toString(), lang);
            opds.AddFacet(ln, lang);
        });

    }

    opds.Groups = new Array<OPDSGroup>();
    {
        const mostRecent = await getMostRecentPublicationFromDb();
        if (isAGoodArray(mostRecent)) {
            const ln = createLink(new URL("/" + query.group + "/" + groups.mostRecent, selfHref).toString(), groups.mostRecent);
            opds.Groups.push(createGroup(mostRecent, ln));
        }
    }
    {
        const mostDown = await getMostDownloadedPublicationFromDb();
        if (isAGoodArray(mostDown)) {
            const ln = createLink(new URL("/" + query.group + "/" + groups.mostDownloaded, selfHref).toString(), groups.mostDownloaded);
            opds.Groups.push(createGroup(mostDown, ln));
        }
    }
    {
        const subjects = await distinctSubject();
        for await (const sub of subjects) {

            const subjectPub = await getSubjectPublicationFromDb(sub);
            if (isAGoodArray(subjectPub)) {
                const ln = createLink(hrefFn("/" + query.subject + "/" + sub), sub);
                opds.Groups.push(createGroup(subjectPub, ln));
            }
        }
    }
    {
        const promote = await getPromotePublicationFromDb();
        if (isAGoodArray(promote))
        {
            opds.Publications = promote;
        }
    }

    return opds;
};