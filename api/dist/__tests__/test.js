/** @format */
import { createReadStream } from 'fs';
import FormData from 'form-data';
import express from 'express';
import axios from 'axios';
const PORT = 5000;
const ENDPOINT = `http://localhost:${PORT}/`;
let server;
process.on('unhandledRejection', (error) => {
    console.warn('unhandledRejection:');
    console.warn(error);
    process.exit(2);
});
start();
async function start() {
    const app = express();
    app.use((req, res, next) => {
        // console.warn({req, res, next})
        next();
    });
    server = app.listen(PORT, () => {
        console.log('listening @', server.address());
        //setTimeout(test, 1000)
        testPing();
        testTonkit();
    });
    server.on('error', (error) => console.warn({ error }));
}
async function testPing() {
    const result = await axios(`${ENDPOINT}ping`);
    console.warn('ping: from api:', result.data);
}
async function testTonkit() {
    const form = new FormData();
    let result, seqno;
    const testgiverAddr = 'kf9mZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZnw8';
    console.warn('healthcheck, last: ');
    result = await axios(`${ENDPOINT}last`);
    // console.warn(result)
    console.warn('gifter account obj from client: ');
    result = await axios(`${ENDPOINT}getaccount?address=${testgiverAddr}`);
    console.warn('getaccount: from api', result.data);
    result = await axios(`${ENDPOINT}getaccount?address=${testgiverAddr}1`);
    console.warn('getaccount: bad address', result.data);
    result = await axios(`${ENDPOINT}runmethod?method=seqno&address=${testgiverAddr}`);
    console.warn('seqno: from api', result.data);
    result = await axios(`${ENDPOINT}runmethod?method=seqno&address=${testgiverAddr}1`);
    console.warn('seqno: bad address', result.data);
    result = await axios(`${ENDPOINT}runmethod?method=badmethod&address=${testgiverAddr}`);
    console.warn('seqno: bad method', result.data);
    form.append('file', createReadStream('new-testgiver-query.boc'));
    try {
        const headers = form.getHeaders();
        result = await axios.post(`${ENDPOINT}sendfile`, form, { headers });
        // console.warn('sendfile:', result.data)
        // console.warn('testAccount', result)
    }
    catch (error) {
        console.error(error);
        console.warn({ error: 'could not call sendfile' });
    }
    server.close();
    console.warn('done');
    process.exit();
}
//# sourceMappingURL=test.js.map