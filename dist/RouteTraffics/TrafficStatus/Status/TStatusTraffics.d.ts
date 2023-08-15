import { Request } from 'express';
import { AnyObject } from 'tn-typescript';
import { Traffic } from '../../Traffic/Traffic';
export declare class TStatusTraffics {
    private served;
    private lost;
    private bypassed;
    private routes;
    private unknowns;
    pushServed({ req, res, startms, closems }: Traffic): number | undefined;
    pushLoss(): void;
    pushBypass(): void;
    getRoute(req: Request): string | null;
    getStatus(): {
        served: number;
        lost: number;
        bypassed: number;
        average: number;
        cputime: number;
        routes: AnyObject;
        unknowns: {
            [x: string]: number;
        };
    };
}
