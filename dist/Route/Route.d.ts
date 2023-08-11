import { TimeString } from './accessories/TimeString';
export interface RouteCdnOptions {
    bunnycdn?: boolean;
    bunnyperma?: boolean;
    bunnysecure?: false | TimeString;
}
export declare const Route: (routebase: string, cdnopts?: RouteCdnOptions) => (target: Function) => void;
