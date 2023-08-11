import { RouteTraffics } from '../../RouteTraffics';
type Record = {
    timestamp: number;
    queueing: number;
    waitTime: number;
};
export declare class TStatusPressure {
    private rt;
    private records;
    constructor(rt: RouteTraffics);
    private record;
    getStatus(): Record[];
}
export {};
