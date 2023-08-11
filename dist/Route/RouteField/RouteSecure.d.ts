import { TimeString } from '../accessories/TimeString';
type Options = {
    timesafe?: TimeString | false;
    query?: boolean;
};
export interface RouteSecureInfo {
    $secure: true;
    name: string;
    secret: string;
    timesafe: string | false;
    query: boolean;
}
export declare const RouteSecure: (secret: string, opts?: Options) => (target: any, name: string) => void;
export {};
