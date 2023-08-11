import { Request, Response } from 'express';
import { AnyObject } from 'tn-typescript';
export declare class TStatusTraffics {
    private served;
    private lost;
    private routes;
    private unknowns;
    pushServed(req: Request, res: Response, startms: number, closems: number): number | undefined;
    pushLoss(): void;
    getRoute(req: Request): string | null;
    getStatus(): {
        served: number;
        lost: number;
        average: number;
        cputime: number;
        routes: AnyObject;
        unknowns: {
            [x: string]: number;
        };
    };
}
