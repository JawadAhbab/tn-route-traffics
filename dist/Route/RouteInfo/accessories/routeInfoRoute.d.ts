import { RouteParamInfo } from '../../RouteField/RouteParam';
import { RouteSecureInfo } from '../../RouteField/RouteSecure';
interface Props {
    routebase: string;
    params: RouteParamInfo[];
    rsi: RouteSecureInfo;
}
export declare const routeInfoRoute: ({ routebase, params, rsi }: Props) => string;
export {};
