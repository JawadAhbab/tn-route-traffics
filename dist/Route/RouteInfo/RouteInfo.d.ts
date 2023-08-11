import { RouteBodyInfo } from '../RouteField/RouteBody';
import { RouteFileInfo } from '../RouteField/RouteFile';
import { RouteParamInfo } from '../RouteField/RouteParam';
import { RouteQueryInfo } from '../RouteField/RouteQuery';
import { RouteResultInfo } from '../RouteField/RouteResult';
import { RouteCdnConfig } from './accessories/routeInfoCdnConfig';
import { RouteSecure } from './accessories/routeInfoRouteSecure';
export type RouteMethod = 'GET' | 'POST';
export interface RouteInfo {
    $route: true;
    route: string;
    method: RouteMethod;
    name: string;
    routesecure: RouteSecure;
    cdnconfig: RouteCdnConfig;
    queries: RouteQueryInfo[];
    params: RouteParamInfo[];
    bodies: RouteBodyInfo[];
    files: RouteFileInfo[];
    results: RouteResultInfo;
    getRouteSecureSecret: () => string | undefined;
}
export declare const createRouteInfo: (method: RouteMethod, routecls: Function, resultcls?: Function) => RouteInfo;
