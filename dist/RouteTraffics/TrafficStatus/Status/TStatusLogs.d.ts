import { Request, Response } from 'express';
import { RouteTraffics } from '../../RouteTraffics';
export declare class TStatusLogs {
    private rt;
    private visits;
    private pressures;
    constructor(rt: RouteTraffics);
    private dump;
    private pressure;
    private logPressure;
    private pushPressure;
    private graphql;
    private visitCommons;
    pushRejectVisit(req: Request, res: Response): void;
    pushVisit(req: Request, res: Response, queuems: number, startms: number, closems: number): void;
}
