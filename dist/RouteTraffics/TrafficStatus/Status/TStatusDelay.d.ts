export declare class TStatusDelay {
    private startCount;
    private delayCount;
    private delayMax;
    private delayTotal;
    push(queuems: number, startms: number): void;
    getStatus(): {
        count: number;
        percentage: number;
        max: number;
        ave: number;
        total: number;
    };
}
