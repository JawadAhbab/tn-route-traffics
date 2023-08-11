import { Request, Response } from 'express';
import { RouteTraffics } from '../RouteTraffics';
import { TStatusPressure } from './Status/TStatusPressure';
import { TStatusTraffics } from './Status/TStatusTraffics';
export declare class TrafficStatus {
    private logs;
    private delay;
    private commons;
    pressure: TStatusPressure;
    traffics: TStatusTraffics;
    constructor(rt: RouteTraffics);
    onReject(req: Request, res: Response): void;
    onQueue(): void;
    onStart(queuems: number, startms: number): void;
    onClose(req: Request, res: Response, queuems: number, startms: number, closems: number): void;
    getStatus(): {
        delay: {
            count: number;
            percentage: number;
            max: number;
            ave: number;
            total: number;
        };
        traffics: {
            served: number;
            lost: number;
            average: number;
            cputime: number;
            routes: import("tn-typescript").AnyObject;
            unknowns: {
                [x: string]: number;
            };
        };
        pressure: {
            timestamp: number;
            queueing: number;
            waitTime: number;
        }[];
        name: string;
        podname: string;
        age: number;
    };
}
