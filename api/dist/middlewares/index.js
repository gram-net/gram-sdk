/** @format */
import parser from 'body-parser';
import cors from 'cors';
export function routesInit(routes, router) {
    for (const route of routes) {
        const { method, path, handler } = route;
        router[method](path, handler);
    }
}
export function middlewareInit(middleware, router) {
    for (const m of middleware) {
        m(router);
    }
}
export function corsHandler(router) {
    router.use(cors({ credentials: true, origin: true }));
}
export function parseHandler(router) {
    router.set('json spaces', 2);
    router.use(parser.urlencoded({ extended: true }));
    router.use(parser.json());
}
//# sourceMappingURL=index.js.map