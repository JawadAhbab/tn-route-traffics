import { RouteSecureInfo } from '../../RouteField/RouteSecure';
export type RouteSecure = {
    name: string;
    timesafe: string | false;
    query: boolean;
} | false;
export declare const routeInfoRouteSecure: (rsi: RouteSecureInfo) => RouteSecure;
