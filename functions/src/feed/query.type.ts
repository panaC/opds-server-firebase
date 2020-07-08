import { queryAllowed, queryQueryQMapping, queryPageTitle } from "../constant";

export type TQuery<T = string> = {
    [key in TQueryAllowed]?: T;
};
export type TQueryAllowed = keyof typeof queryAllowed | typeof queryQueryQMapping | typeof queryPageTitle;

export interface IParsedQuery extends TQuery<any> {
    query?: string,
    title?: string,
    author?: string,
    subject?: string,
    publisher?: string,
    language?: string,
    page?: number,
    number?: number,
    group?: string,
    pagetitle?: string,
};

