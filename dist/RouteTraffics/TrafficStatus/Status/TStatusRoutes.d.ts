import { Request, Response } from 'express';
import { AnyObject } from 'tn-typescript';
export declare class TStatusRoutes {
    private routes;
    private unknowns;
    push(req: Request, res: Response, startms: number, closems: number): number | undefined;
    getRoute(req: Request): string | null;
    getStatus(): {
        counts: number;
        average: number;
        cputime: number;
        routes: AnyObject;
        unknowns: {
            [x: string]: number;
        };
    };
}
