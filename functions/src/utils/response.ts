
import * as functions from "firebase-functions";

export const response = (res: functions.Response) =>
    (status: number, error?: string, data?: any) => {

        res
            .status(status)
            .json(
                status !== 200 ? {
                    error,
                    data,
                    status,
                } : data
            );
    }