/** @format */
/// <reference types="qs" />
/// <reference types="express" />
declare const _default: ({
    method: string;
    path: string;
    handler: (request: import("express").Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs>, response: import("express").Response<any>) => Promise<void>;
} | {
    method: string;
    path: string;
    handler: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs>[];
})[];
export default _default;
//# sourceMappingURL=index.d.ts.map