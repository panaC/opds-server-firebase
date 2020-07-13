import { authDb } from "../db/auth";
import { DEFAULT_TOKEN } from "../constant";

export const extractBearerToken = (bearer: string | undefined) => bearer?.split("Bearer ")[1];

export const setTokenInDb = async (token: string) => {

    const doc = await authDb.get()
    if (doc.exists) {
        await authDb.update({ token, });
    } else {
        await authDb.set({ token, });
    }
}

export const getTokenInDb = async () => {

    const data = await authDb.get();

    return data.data()?.token || DEFAULT_TOKEN;
}

export const isAuthentified = async (bearerToken: string | undefined): Promise<boolean> => {

    const token = extractBearerToken(bearerToken);

    const tokenDb = await getTokenInDb();

    // console.log("isAuthentified", tokenDb, token, tokenDb === token);

    return tokenDb === token;
} 