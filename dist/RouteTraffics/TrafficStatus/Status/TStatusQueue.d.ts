import { RouteTraffics } from '../../RouteTraffics';
export declare class TStatusQueue {
    private rt;
    constructor(rt: RouteTraffics);
    getStatus(): {
        running: number;
        waiting: number;
        waitTime: number;
    };
}
