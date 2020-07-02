import * as functions from "firebase-functions";
import { response } from "../utils/response";
import { basename } from "path";
import { nanoid } from "nanoid";
import { save, deleteFile } from "./service";

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

    const contentType = req.header("content-type") || "";
    
    let filename = req.query["filename"];
    if (typeof filename === "string" && filename) {

        filename = nanoid() + "." + basename(filename);
        // const ext = extname(bname);
    } else {

        const ext = contentType === "application/epub+zip"
            ? "epub"
            : contentType === "application/audiobook+zip"
                ? "audiobook"
                : "zip";
        filename = nanoid() + "." + ext;
    }

    // https://firebase.google.com/docs/functions/http-events#read_values_from_the_request
    const buffer = req.rawBody;

    if (Buffer.isBuffer(buffer)) {
        console.log("buffer loaded");
    
        const magic = buffer.readUIntBE(0, 4);
        if (magic === 0x504B0304) {
            console.log("Is a zip file");

            try {
                const data = await save(buffer, filename);

                send(200, "", data);
            } catch (e) {
                send(500, e.toString(), e.stack);
            }

        } else {
            console.log("isn't a zip file");

            send(400, "the file uploaded is not a zip");
        }
    } else {
        send(400, "not a valid file uploaded");
    }

}

export const delete_ = async (req: functions.https.Request, res: functions.Response<any>) => {

    const send = response(res);

    let filename = req.query["id"];
    if (typeof filename === "string" && filename) {

        try {
            await deleteFile(filename);
            send(200);
        } catch (e) {
            send(500, e.toString(), e.stack);
        }
    }

}