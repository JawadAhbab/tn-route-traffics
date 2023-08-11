import { OptionLess } from 'tn-typescript';
import { RouteCdnOptions } from '../../Route';
import { RouteParamInfo } from '../../RouteField/RouteParam';
type BunnySecureRoute = {
    tokenroute: string;
    params: RouteParamInfo[];
};
export type RouteCdnConfig = OptionLess<RouteCdnOptions> & {
    secureroute?: BunnySecureRoute;
};
export declare const routeInfoCdnConfig: (routecls: Function, params: RouteParamInfo[]) => {
    routebase: string;
    cdnconfig: RouteCdnConfig;
};
export {};
