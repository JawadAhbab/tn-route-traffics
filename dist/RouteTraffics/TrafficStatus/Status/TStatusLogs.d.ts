import { Request, Response } from 'express';
import UAParser from 'ua-parser-js';
import { RouteTraffics } from '../../RouteTraffics';
export type TrafficLog<Extras extends {} = {}> = Extras & {
    reqid: string;
    timestamp: number;
    status: 'REJECTED' | 'ACCEPTED';
    graphql: boolean;
    route: string | null;
    url: string;
    userip: string;
    delay: number;
    took: number;
    statuscode: number;
    agent: {
        browser: UAParser.IBrowser;
        engine: UAParser.IEngine;
        os: UAParser.IOS;
        device: UAParser.IDevice;
        cpu: UAParser.ICPU;
    };
};
export declare class TStatusLogs {
    private rt;
    private data;
    constructor(rt: RouteTraffics);
    private dump;
    private commons;
    private graphql;
    pushReject(req: Request, res: Response): void;
    push(req: Request, res: Response, queuems: number, startms: number, closems: number): void;
}
