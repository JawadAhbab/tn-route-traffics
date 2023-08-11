/// <reference types="multer" />
import { AnyObject, ObjectOf } from 'tn-typescript';
import { RouteInfo } from '../../RouteInfo/RouteInfo';
type Files = ObjectOf<Express.Multer.File[]>;
export declare const routeFieldsFiles: (fields: AnyObject, files: Files, route: RouteInfo) => void;
export {};
