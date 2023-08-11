import { AnyObject } from 'tn-typescript';
export declare class RouteStatus {
    private routes;
    saveStatus(routename: string, time: number, statusCode: number): void;
    createSummery(): {
        counts: number;
        average: string;
        cputime: string;
        routes: AnyObject;
    };
}
export declare const routeStatus: RouteStatus;
