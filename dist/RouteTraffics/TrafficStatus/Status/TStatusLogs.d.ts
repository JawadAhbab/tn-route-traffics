import { Request, Response } from 'express';
import { RouteTraffics } from '../../RouteTraffics';
export declare class TStatusLogs {
    private rt;
    private data;
    constructor(rt: RouteTraffics);
    private dump;
    private pushPressure;
    private graphql;
    private visitCommons;
    pushRejectVisit(req: Request, res: Response): void;
    pushVisit(req: Request, res: Response, queuems: number, startms: number, closems: number): void;
}
