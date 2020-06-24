import { webpubDb } from "../webpub/db";

export const distinctLanguage = async () => {

    const snap = await (await webpubDb.select('publication.metadata.language').get()).docs;
    const data = snap.reduce((pv, cv) => pv.add((cv.data() as any).publication.metadata.language), new Set<string>());

    return [...data];
}