import { Request, Response } from 'express';
import { Func } from 'tn-typescript';
import { RouteTraffics } from '../RouteTraffics';
export type TrafficProps = {
    req: Request;
    res: Response;
    next: Func;
};
export declare class Traffic {
    private rt;
    queuems: number;
    startms: number;
    closems: number;
    private req;
    private res;
    private next;
    constructor(rt: RouteTraffics, { req, res, next }: TrafficProps);
    started: boolean;
    closed: boolean;
    unlocked: boolean;
    private timeouts;
    start(): void;
    bypass(): void;
    private unlock;
    private close;
}
