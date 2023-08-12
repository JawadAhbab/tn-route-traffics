/// <reference types="qs" />
import { Request, Response } from 'express';
import { AnyObject } from 'tn-typescript';
export interface RouteTrafficsOpts {
    concurrency?: number;
    maxQueue?: number;
    unlockTimeout?: number | string;
    forceCloseTimeout?: number | string;
    excludes?: string[];
    bypass?: string[];
    bypassSecret?: string;
    logDump?: (dump: string) => void;
    logDumpInterval?: number | string;
    logDumpExtras?: {
        base?: () => AnyObject;
        pressure?: () => AnyObject;
        visit?: (req: Request, res: Response) => AnyObject;
    };
}
export declare class TrafficOpts {
    protected opts: RouteTrafficsOpts;
    get concurrency(): number;
    get maxQueue(): number;
    get unlockTimeout(): string | number;
    get forceCloseTimeout(): string | number;
    get excludes(): string[];
    get bypass(): string[];
    get bypassSecret(): string;
    get logDump(): (dump: string) => void;
    get logDumpInterval(): string | number;
    get logDumpExtras(): {
        base: (() => AnyObject) | (() => null);
        pressure: (() => AnyObject) | (() => null);
        visit: ((req: Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>, res: Response<any, Record<string, any>>) => AnyObject) | (() => null);
    };
}
