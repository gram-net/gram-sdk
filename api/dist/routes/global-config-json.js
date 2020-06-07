/** @format */
import { readFileSync } from 'fs';
export default [
    {
        method: 'get',
        path: '/config-global.json',
        handler: async (request, response) => {
            const file = readFileSync('/tmp/config-global.json', 'utf-8');
            await response.status(200).send(file);
        }
    }
];
//# sourceMappingURL=global-config-json.js.map