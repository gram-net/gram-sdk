/** @format */
import { Router } from 'express';
import Route from '../models/route.model.js';
import Wrapper from '../models/wrapper.model.js';
export declare function routesInit(routes: Route[], router: Router): void;
export declare function middlewareInit(middleware: Wrapper[], router: Router): void;
export declare function corsHandler(router: Router): void;
export declare function parseHandler(router: any): void;
//# sourceMappingURL=index.d.ts.map