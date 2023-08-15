import { Request, Response } from 'express';
import { RouteTraffics } from '../../RouteTraffics';
import { Traffic } from '../../Traffic/Traffic';
export declare class TStatusLogs {
    private rt;
    private visits;
    private pressures;
    constructor(rt: RouteTraffics);
    private dump;
    private pushPressure;
    private graphql;
    private visitCommons;
    pushRejectVisit(req: Request, res: Response): void;
    pushVisit({ req, res, queuems, startms, closems, bypass }: Traffic): void;
}
