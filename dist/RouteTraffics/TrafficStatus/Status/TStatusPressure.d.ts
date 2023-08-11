import { RouteTraffics } from '../../RouteTraffics';
export declare class TStatusPressure {
    private rt;
    constructor(rt: RouteTraffics);
    getStatus(): {
        queueing: number;
        waitTime: number;
    };
}
