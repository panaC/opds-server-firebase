import { feedDoc } from "../db/feed";
import { IFeedDoc } from "../db/interface/feed.interface";
import { createFeed } from "./createFeed";
import { TaJsonSerialize } from "r2-lcp-js/dist/es8-es2017/src/serializable";

export const getFeed = async () => {
    let feed: IFeedDoc = {};

    const doc = await feedDoc.get();
    if (doc.exists) {
        feed = doc.data() as IFeedDoc;
    } else {
        const opdsFeed = await createFeed();
        const feed = TaJsonSerialize(opdsFeed);
        await feedDoc.update(feed);
    }

    return feed;
}