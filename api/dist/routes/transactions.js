/** @format */
import { callCppBackend } from '../utilities/index.js';
export default [
    {
        method: 'get',
        path: '/transactions',
        handler: async (request, response) => {
            const account = request.query.id || request.query.account || false;
            let code;
            let result;
            if (!account) {
                code = 602;
                result = 'account is empty';
            }
            else {
                const urlStructAcc = '/account?account=' + account;
                const resultAccTrans = (await callCppBackend(urlStructAcc).catch((error) => {
                    console.log(error);
                }));
                try {
                    if (resultAccTrans && resultAccTrans.last_transaction) {
                        const transaction = resultAccTrans.last_transaction;
                        const urlStruct = '/transactions?account=' +
                            transaction.account +
                            '&lt=' +
                            transaction.lt +
                            '&hash=' +
                            transaction.hash;
                        console.log('urlStruct', urlStruct);
                        code = 200;
                        result = await callCppBackend(urlStruct).catch((error) => {
                            console.log(error);
                        });
                    }
                    else {
                        code = 404;
                        result = 'account not found.' + resultAccTrans;
                    }
                }
                catch (e) {
                    console.error(e);
                    code = 500;
                    result = 'server error';
                }
            }
            response.status(code).json(result);
        }
    }
];
//# sourceMappingURL=transactions.js.map