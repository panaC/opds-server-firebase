import { publicationDb } from "../../db/publication";

export const distinctLanguage = async () => {

    const snap = await (await publicationDb.select('publication.metadata.language').get()).docs;
    const data = snap.reduce((pv, cv) => pv.add((cv.data() as any).publication.metadata.language), new Set<string>());

    return [...data];
}

export const distinctSubject = async () => {

    const snap = await (await publicationDb.select('publication.metadata.subject').get()).docs;
    const data = snap.reduce((pv, cv) => pv.add((cv.data() as any).publication.metadata.subject), new Set<string>());

    return [...data];
}
