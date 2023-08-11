export type Getter = (value: any) => any;
export type Validator<V = any> = (value: V) => boolean;
export type Selects = string[] | number[] | readonly number[] | readonly string[];
