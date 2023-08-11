import { RequestHandler } from 'express';
interface Options {
    excludes?: string[];
}
export declare const routeStatusMiddleware: (opts?: Options) => RequestHandler;
export {};
