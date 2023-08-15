import { RouteTraffics } from '../../RouteTraffics';
export interface TSPressureRecord {
    timestamp: number;
    waitTime: number;
    queueing: {
        regular: number;
        bypass: number;
        total: number;
    };
}
export declare class TStatusPressure {
    private rt;
    private records;
    constructor(rt: RouteTraffics);
    private record;
    getStatus(): TSPressureRecord[];
}
