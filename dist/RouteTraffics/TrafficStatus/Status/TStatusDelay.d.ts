import { Traffic } from '../../Traffic/Traffic';
export declare class TStatusDelay {
    private startCount;
    private delayCount;
    private delayMax;
    private delayTotal;
    push({ queuems, startms }: Traffic): void;
    getStatus(): {
        count: number;
        percentage: number;
        max: number;
        ave: number;
        total: number;
    };
}
