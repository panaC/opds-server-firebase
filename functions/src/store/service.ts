import { admin } from "../utils/admin";

export const save = async (buffer: Buffer, filename: string) => {

    const bucket = admin.storage().bucket();
    const file = bucket.file(filename);

    await file.save(buffer);

    return {
        id: filename,
        url: "https://firebasestorage.googleapis.com/v0/b/" + admin.instanceId().app.options.projectId + ".appspot.com/o/" + encodeURI(filename) + "?alt=media",
    };

}

export const deleteFile = async (id: string) => {

    const bucket = admin.storage().bucket();
    const file = bucket.file(id);

    await file.delete();
}