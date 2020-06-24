
import { config } from "firebase-functions";
import { OPDSFeed } from "r2-opds-js/dist/es8-es2017/src/opds/opds2/opds2";
import { OPDSMetadata } from "r2-opds-js/dist/es8-es2017/src/opds/opds2/opds2-metadata";
import { OPDSLink } from "r2-opds-js/dist/es8-es2017/src/opds/opds2/opds2-link";
import { OPDSFacet } from "r2-opds-js/dist/es8-es2017/src/opds/opds2/opds2-facet";
import { LINK_TYPE, selfHref, selfHrefClone } from "./constant";
import { distinctLanguage } from "./query";

const createMetadata = (
    itemsPerPage?: number,
    numberOfItems?: number,
    currentPage?: number,
    search?: string
): OPDSMetadata => {

    const metadata = new OPDSMetadata();

    if (itemsPerPage) {
        metadata.ItemsPerPage = itemsPerPage;
    }
    if (numberOfItems) {
        metadata.NumberOfItems = numberOfItems;
    }
    if (currentPage) {
        metadata.CurrentPage = currentPage;
    }
    if (search) {
        metadata.SubTitle = "SEARCH";
        metadata.Description = search;
    }
    metadata.Title = config().server.name || "OPDS-SERVER";

    return metadata;
}

const createLinks = (): OPDSLink[] => {

    const links = new Array<OPDSLink>();
    {
        const link = new OPDSLink();
        link.Rel = ["self"];
        link.Title = "HOME"; // I18n
        link.TypeLink = LINK_TYPE;
        link.Href = selfHref.toString();

        links.push(link);
    }

    return links;
}

const createFacets = async (): Promise<OPDSFacet[]> => {
    const facets = new Array<OPDSFacet>();

    {
        const languages = await distinctLanguage();

        const facetsLang = languages.map((v) => {
            const facet = new OPDSFacet();
            facet.Metadata.Title = v;
            
            const link = new OPDSLink();
            link.Title = v;
            link.TypeLink = LINK_TYPE;

            const href = selfHrefClone();
            href.searchParams.append("language", v);
            link.Href = href.toString();

            facet.Links = [];
            facet.Links.push(link);

            return facet;
        })
        facets.concat(facetsLang);
    }

    return facets;
}

export const createFeed = async (): Promise<OPDSFeed> => {

    const opds = new OPDSFeed();

    opds.Metadata = createMetadata();
    opds.Links = createLinks();
    opds.Facets = await createFacets();

    return opds;
};