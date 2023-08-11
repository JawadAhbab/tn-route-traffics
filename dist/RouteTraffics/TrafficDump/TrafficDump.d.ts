/// <reference types="ua-parser-js" />
export type TrafficDumpData<Extras extends {} = {}, PressureExtras extends {} = {}, VisitExtras extends {} = {}> = Extras & {
    pressures: TrafficDumpPressure<PressureExtras>[];
    visits: TraffisDumpVisit<VisitExtras>[];
};
export type TrafficDumpPressure<Extras extends {} = {}> = Extras & {
    timestamp: number;
    queueing: number;
    waitTime: number;
};
export type TraffisDumpVisit<Extras extends {} = {}> = Extras & {
    reqid: string;
    timestamp: number;
    status: 'REJECTED' | 'ACCEPTED';
    graphql: boolean;
    route: string | null;
    url: string;
    userip: string;
    delay: number;
    took: number;
    statuscode: number;
    agent: {
        browser: UAParser.IBrowser;
        engine: UAParser.IEngine;
        os: UAParser.IOS;
        device: UAParser.IDevice;
        cpu: UAParser.ICPU;
    };
};
