export declare class TStausTraffics {
    private acceptCount;
    private rejectCount;
    accept(): void;
    reject(): void;
    getStatus(): {
        served: number;
        lost: number;
        percentage: number;
    };
}
