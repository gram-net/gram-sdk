/** @format */
import multer from 'multer';
import { promises as fsp, readFileSync } from 'fs';
import { join } from 'path';
import { LiteClient } from '../lite-client.js';
const lc = new LiteClient();
const storage = multer.diskStorage({
    destination: join('uploads'),
    filename: function (req, file, cb) {
        const newDate = new Date();
        const uniqueSuffix = newDate.getTime() + '-' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + '-' + uniqueSuffix);
    }
});
const upload = multer({ storage });
//
export default [
    {
        method: 'post',
        path: '/sendfile',
        handler: [
            upload.single('bocFile'),
            async (request, response) => {
                const { file } = request;
                console.warn(file);
                let result;
                try {
                    fsp.rename(file.path, file.path + '.boc');
                    const result = await lc.sendfile(readFileSync(file.path + '.boc'));
                    response.json({ result });
                }
                catch (error) {
                    if (!file) {
                        response.status(400);
                        // console.warn("sendfile return 400, no file uploaded")
                        return response.json({ error: 'sendfile no boc file uploaded' });
                    }
                    return response.status(500).json({ error });
                }
                response.status(200).json(result);
            }
        ]
    }
];
//# sourceMappingURL=sendfile.js.map