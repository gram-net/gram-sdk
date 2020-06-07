/** @format */
import { readFileSync } from 'fs';
export default [
    {
        method: 'get',
        path: '/server.pub',
        handler: async (request, response) => {
            response.write(readFileSync('/tmp/server.pub', 'binary'), 'binary');
            response.end(undefined, 'binary');
        }
    }
];
//# sourceMappingURL=console-pubkey.js.map