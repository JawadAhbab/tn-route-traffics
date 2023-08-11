/// <reference types="qs" />
import { Request, Response } from 'express';
import { AnyObject } from 'tn-typescript';
export interface RouteTrafficsOpts {
    concurrency?: number;
    maxQueue?: number;
    unlockTime?: number | string;
    excludes?: string[];
    logDump?: (dump: string) => void;
    logDumpInterval?: number | string;
    logDumpExtras?: (req: Request, res: Response) => AnyObject;
}
export declare class TrafficOpts {
    protected opts: RouteTrafficsOpts;
    get concurrency(): number;
    get maxQueue(): number;
    get unlockTime(): string | number;
    get excludes(): string[];
    get logDump(): (dump: string) => void;
    get logDumpInterval(): string | number;
    get logDumpExtras(): ((req: Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>, res: Response<any, Record<string, any>>) => AnyObject) | (() => void);
}
