import { Request, Response } from 'express';
import { RouteTraffics } from '../RouteTraffics';
import { TStatusRoutes } from './Status/TStatusRoutes';
export declare class TrafficStatus {
    private logs;
    private delay;
    private traffic;
    private queue;
    private commons;
    routes: TStatusRoutes;
    constructor(rt: RouteTraffics);
    onReject(req: Request, res: Response): void;
    onQueue(): void;
    onStart(queuems: number, startms: number): void;
    onClose(req: Request, res: Response, queuems: number, startms: number, closems: number): void;
    getStatus(): {
        queue: {
            running: number;
            waiting: number;
            waitTime: number;
        };
        traffics: {
            served: number;
            lost: number;
            percentage: number;
        };
        delay: {
            count: number;
            percentage: number;
            max: number;
            ave: number;
            total: number;
        };
        routes: {
            counts: number;
            average: number;
            cputime: number;
            routes: import("tn-typescript").AnyObject;
            unknowns: {
                [x: string]: number;
            };
        };
        name: string;
        podname: string;
        age: number;
    };
}
