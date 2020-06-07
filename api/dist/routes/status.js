/** @format */
import { callCppBackend, respond } from '../utilities/index.js';
export default [
    {
        method: 'get',
        path: '/status',
        handler: async (request, response) => {
            callCppBackend('/status')
                .then((result) => {
                respond(response, result);
            })
                .catch((error) => {
                response.send(error);
            });
        }
    }
];
//# sourceMappingURL=status.js.map