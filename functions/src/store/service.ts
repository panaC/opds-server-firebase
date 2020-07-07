import { admin } from "../utils/admin";
import { nanoid } from "nanoid";
import { storeHrefFn } from "../constant";

export const save = async (buffer: Buffer, filename: string) => {

    const id = nanoid() + "." + filename;
    const bucket = admin.storage().bucket();
    const file = bucket.file(id);

    // bug to save metadata in save method
    await file.save(buffer);

    await file.setMetadata({
        metadata: {
            "filename": filename,
        },
    });

    return {
        id,
        url: storeHrefFn(id),
    };
}

export const deleteFile = async (id: string) => {

    const bucket = admin.storage().bucket();
    const file = bucket.file(id);

    await file.delete();
}

export const getUrlFile = async (id: string) => {
    
    const bucket = admin.storage().bucket();
    const file = bucket.file(id);

    const [isExists] = await file.exists();
    if (isExists) {

        const [{metadata: {filename}}] = await file.getMetadata();

        const [signedUrl] = await file.getSignedUrl({
            action: "read",
            promptSaveAs: filename || "publication.zip",
            expires: new Date().valueOf() + 60, // 60 seconds just the time to download it
            virtualHostedStyle: true,
        });

        return signedUrl;

    } else {
        throw new Error("no file found");
    }
}