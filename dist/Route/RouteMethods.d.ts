/// <reference types="node" />
type ResultClass = Function | BufferConstructor | StringConstructor;
export declare const RouteGet: (routecls: Function, resultcls?: ResultClass) => <TFunction extends Function, Y>(target: object | TFunction, propertyKey?: string | symbol | undefined, descriptor?: TypedPropertyDescriptor<Y> | undefined) => void;
export declare const RoutePost: (routecls: Function, resultcls?: ResultClass) => <TFunction extends Function, Y>(target: object | TFunction, propertyKey?: string | symbol | undefined, descriptor?: TypedPropertyDescriptor<Y> | undefined) => void;
export {};
