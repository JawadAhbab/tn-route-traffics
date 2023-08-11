import { Selects } from './accessories/RouteFieldTypes';
declare const rtypes: readonly ["string", "number", "boolean", "object", "string[]", "number[]", "boolean[]", "object[]", "any[]"];
export type RouteResultType = (typeof rtypes)[number];
export type RouteResultInfo = RouteResultJson[] | 'String' | 'Buffer';
export interface RouteResultJson {
    $result: true;
    name: string;
    type: RouteResultType;
    selects: Selects | null;
    optional: boolean;
    object: RouteResultJson[];
}
interface Options {
    selects?: Selects;
    optional?: boolean;
    type?: Function | [Function];
}
export declare const RouteResult: (opts?: Options) => (target: any, name: string) => void;
export {};
