import * as functions from "firebase-functions";
import { response } from "../utils/response";
import { basename } from "path";
import { save, deleteFile, getUrlFile } from "./service";
import { isAuthentified } from "../utils/auth";

export const create = async (req: functions.https.Request, res: functions.Response<any>) => {

    const send = response(res);

    // res.download
    // console.log("req baseUrl");
    // console.log(req.baseUrl);

    // console.log("req body", req.body);
    // console.log("req rawBody", req.rawBody);
    // console.log("req headers", req.headers);
    // console.log("req hostname", req.hostname);
    // console.log("req method", req.method);
    // console.log("req params", req.params);
    // console.log("req query", req.query);
;
    const auth = await isAuthentified(req.headers.authorization);
    if (!auth) {
        return send(401, "not authentified");
    }

    const contentType = req.header("content-type") || "";
    
    let filename = req.query["filename"] || req.path;
    if (typeof filename === "string" && filename) {

        filename = basename(filename);
    } else {

        const ext = contentType === "application/epub+zip"
            ? "epub"
            : contentType === "application/audiobook+zip"
                ? "audiobook"
                : "zip";
        filename = "publication." + ext;
    }

    // https://firebase.google.com/docs/functions/http-events#read_values_from_the_request
    const buffer = req.rawBody;

    if (Buffer.isBuffer(buffer)) {
        console.log("buffer loaded");
    
        // disable magic condition : /store can accept zip and all image formats (jpg, png, gif, ...)
        // const magic = buffer.readUIntBE(0, 4);
        // if (magic === 0x504B0304) {
        //     console.log("Is a zip file");

            try {
                const data = await save(buffer, filename);

                send(201, "", data);
            } catch (e) {
                send(500, e.toString(), e.stack);
            }

        // } else {
        //     console.log("isn't a zip file");

        //     send(400, "the file upf loaded is not a zip");
        // }
    } else {
        send(400, "not a valid file uploaded");
    }

}

export const delete_ = async (req: functions.https.Request, res: functions.Response<any>) => {

    const send = response(res);
    const auth = await isAuthentified(req.headers.authorization);
    if (!auth) {
        return send(401, "not authentified");
    }

    let id = basename(req.path);
    if (typeof id === "string" && id) {

        try {
            await deleteFile(id);
            send(204);
        } catch (e) {
            send(500, e.toString(), e.stack);
        }
    }
}

export const read = async (req: functions.https.Request, res: functions.Response<any>) => {

    const send = response(res);

    let id = basename(req.path);
    // console.log(id);
    
    if (typeof id === "string" && id) {

        try {
            const url = await getUrlFile(id);

            res.redirect(307, url);
        } catch (e) {
            send(500, e.toString(), e.stack);
        }
    }
}