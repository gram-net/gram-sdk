/** @format */
import axios from 'axios';
import { environment } from '../config.js';
export function respondOK(request) {
    return request.method + ' ' + request.url + ' [OK]';
}
export async function respond(response, result) {
    return await response.status(200).json(result);
}
export async function callCppBackend(path) {
    const rurl = environment.CPP.URL + ':' + environment.CPP.PORT + path;
    console.warn('CALL CPP URL', rurl);
    return new Promise((resolve, reject) => {
        // ETIMEDOUT ENETUNREACH
        axios
            .get(rurl)
            .catch((e) => {
            console.error(e);
            reject(e);
        })
            .then(function (result) {
            // console.warn(result.data)
            resolve(result.data);
        });
    });
}
//# sourceMappingURL=index.js.map