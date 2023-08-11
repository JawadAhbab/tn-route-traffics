import { Traffic, TrafficProps } from './Traffic/Traffic';
import { RouteTrafficsOpts, TrafficOpts } from './TrafficOpts/TrafficOpts';
import { TrafficStatus } from './TrafficStatus/TrafficStatus';
export declare class RouteTraffics extends TrafficOpts {
    traffics: Traffic[];
    status: TrafficStatus;
    begin(opts: RouteTrafficsOpts): void;
    private checkAccept;
    pushTraffic(props: TrafficProps): void;
    check(): void;
}
export declare const $routeTraffics: RouteTraffics;
