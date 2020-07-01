
import { config } from "firebase-functions";
import algoliasearch, { SearchIndex } from "algoliasearch";
import { algoliaEnabled } from "../constant";

export let algoliaIndex: SearchIndex;

if (algoliaEnabled) {

    const algolia = algoliasearch(
        config().algolia.appid,
        config().algolia.apikey
      );
    
    algoliaIndex = algolia.initIndex("publication");
}
