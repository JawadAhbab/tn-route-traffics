declare const filetypes: readonly ["file", "file[]"];
type FileType = (typeof filetypes)[number];
type FileSizeUnit = 'G' | 'M' | 'K' | '';
type FileSize = `${number}${FileSizeUnit}`;
export interface RouteFileInfo {
    $file: true;
    name: string;
    type: FileType;
    selects: null;
    optional: boolean;
    validators: RouteFileInfoValidators;
}
export interface RouteFileInfoValidators {
    maxsize: number;
    limit: number;
    mimetypes: null | string[];
}
interface Options {
    optional?: boolean;
    maxsize?: FileSize | number;
    limit?: number;
    mimetype?: null | string | string[];
}
export declare const RouteFile: (opts?: Options) => (target: any, name: string) => void;
export {};
