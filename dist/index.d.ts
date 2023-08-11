import { Request, Response } from 'express';
import { Func } from 'tn-typescript';
import { RouteTrafficsOpts } from './RouteTraffics/TrafficOpts/TrafficOpts';
export declare const routeTrafficMiddleware: (opts?: RouteTrafficsOpts) => (req: Request, res: Response, next: Func) => void;
