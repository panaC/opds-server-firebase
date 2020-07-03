import { publicationDb } from "../../db/publication";
import { isAGoodArray } from "../../constant";

export const distinctLanguage = async () => {

    const snap = await publicationDb.select("metadataLanguage").get();
    const docsArray = snap.docs;
    const dataArray = docsArray.map((v) => v.data());
    const langSet = dataArray.reduce(
        (pv, cv) => {
            // @ts-ignore
            const a = cv.metadataLanguage;
            if (a && isAGoodArray(a)) {
                a.forEach((lang) => lang ?? pv.add(lang));
            }
            return pv;
        },
        new Set<string>()
    );

    return [...langSet];
}

export const distinctSubject = async () => {

    const snap = await publicationDb.select("metadataSubject").get();
    const docsArray = snap.docs;
    const dataArray = docsArray.map((v) => v.data());
    const subSet = dataArray.reduce(
        (pv, cv) => {
            // @ts-ignore
            const a = cv.metadataSubject;
            if (a && isAGoodArray(a)) {
                a.forEach((sub) => sub ?? pv.add(sub));
            }
            return pv;
        },
        new Set<string>()
    );

    return [...subSet];
}
