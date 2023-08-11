/// <reference types="qs" />
/// <reference types="multer" />
import { ExecutionContext } from '@nestjs/common';
import { RouteInfo } from '../../RouteInfo/RouteInfo';
import { ObjectOf } from 'tn-typescript';
type Files = ObjectOf<Express.Multer.File[]>;
export declare const routeFieldsEssentials: (ctx: ExecutionContext) => {
    params: import("express-serve-static-core").ParamsDictionary;
    body: any;
    query: import("qs").ParsedQs;
    files: Files;
    route: RouteInfo;
};
export {};
