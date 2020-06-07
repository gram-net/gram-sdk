/** @format */
import { LiteClient } from '../lite-client.js';
const lc = new LiteClient();
export default [
    {
        method: 'get',
        path: '/runmethod',
        handler: async (request, response) => {
            const account = request.query.account;
            const method = request.query.method;
            let code;
            let result;
            if (!account) {
                code = 602;
                result = 'account is empty';
            }
            else {
                const result = await lc.runmethod(account, method);
                // console.warn(result)
                code = 200;
            }
            response.status(code).json(result);
        }
    }
];
//# sourceMappingURL=runmethod.js.map