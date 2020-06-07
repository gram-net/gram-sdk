/** @format */
import { callCppBackend, respond } from '../utilities/index.js';
export default [
    {
        method: 'get',
        path: '/last',
        handler: async (request, response) => {
            callCppBackend('/last')
                .then((result) => {
                respond(response, result);
            })
                .catch((error) => {
                response.send(error);
            });
        }
    }
];
//# sourceMappingURL=last.js.map