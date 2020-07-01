import { publicationDb } from "../../db/publication";
import { isAGoodArray } from "../constant";

export const distinctLanguage = async () => {

    const snap = await publicationDb.select("publication.metadata.language").get();
    const docsArray = snap.docs;
    const dataArray = docsArray.map((v) => v.data());
    const langSet = dataArray.reduce(
        (pv, cv) => {
            const a = cv.publication?.Metadata?.Language;
            if (isAGoodArray(a)) {
                a.forEach((lang) => pv.add(lang));
            }
            return pv;
        },
        new Set<string>()
    );

    return [...langSet];
}

export const distinctSubject = async () => {

    const snap = await publicationDb.select("publication.metadata.subject").get();
    const docsArray = snap.docs;
    const dataArray = docsArray.map((v) => v.data());
    const subSet = dataArray.reduce(
        (pv, cv) => {
            const a = cv.publication?.Metadata?.Subject;
            if (isAGoodArray(a)) {
                a.forEach((sub) => sub.Name ?? pv.add(sub.Name));
            }
            return pv;
        },
        new Set<string>()
    );

    return [...subSet];
}
