import { RouteInfo } from '../RouteInfo/RouteInfo';
export declare const RouteSecureGuard: (route: RouteInfo) => <TFunction extends Function, Y>(target: object | TFunction, propertyKey?: string | symbol | undefined, descriptor?: TypedPropertyDescriptor<Y> | undefined) => void;
