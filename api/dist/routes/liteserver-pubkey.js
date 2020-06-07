/** @format */
import { readFileSync } from 'fs';
export default [
    {
        method: 'get',
        path: '/liteserver.pub',
        handler: async (request, response) => {
            response.write(readFileSync('/tmp/liteserver.pub', 'binary'), 'binary');
            response.end(undefined, 'binary');
        }
    }
];
//# sourceMappingURL=liteserver-pubkey.js.map