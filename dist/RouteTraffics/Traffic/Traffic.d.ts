import { Request, Response } from 'express';
import { Func } from 'tn-typescript';
import { RouteTraffics } from '../RouteTraffics';
export type TrafficProps = {
    req: Request;
    res: Response;
    next: Func;
};
type Opts = {
    bypass: boolean;
};
export declare class Traffic {
    private rt;
    queuems: number;
    startms: number;
    closems: number;
    req: Request;
    res: Response;
    bypass: boolean;
    private next;
    constructor(rt: RouteTraffics, tprops: TrafficProps, opts: Opts);
    started: boolean;
    closed: boolean;
    unlocked: boolean;
    private timeouts;
    start(): void;
    private unlock;
    private close;
}
export {};
