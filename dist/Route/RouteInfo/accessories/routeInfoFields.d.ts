import { RouteBodyInfo } from '../../RouteField/RouteBody';
import { RouteFileInfo } from '../../RouteField/RouteFile';
import { RouteParamInfo } from '../../RouteField/RouteParam';
import { RouteQueryInfo } from '../../RouteField/RouteQuery';
import { RouteSecureInfo } from '../../RouteField/RouteSecure';
export declare const routeInfoFields: (routecls: Function) => {
    params: RouteParamInfo[];
    files: RouteFileInfo[];
    queries: RouteQueryInfo[];
    bodies: RouteBodyInfo[];
    rsi: RouteSecureInfo;
};
