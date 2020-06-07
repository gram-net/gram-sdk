/** @format */

import { Request, Response, Router } from 'express'
import { respond } from '../utilities/index.js'

export default [
  {
    method: 'get',
    path: '/',
    handler: async (request: Request, response: Response) => {
      respond(response, [
        'Hello from @gram-net/api!',
        'Currently available:',
        '--------------------',
        'GET / (this page)',
        'POST /sendfile {bocFile:Blob}',
        'GET /last',
        'GET /runmethod?account=<ADDRESS>&method=<METHOD>',
        'GET /status',
        'GET /account?account=<ADDRESS>',
        'GET /transaction?account=<ADDRESS>&lt=<EPOCHTIME>&hash=<LASTTXHASH>',
        'GET /transactions?account=<ADDRESS>',
        'GET /liteserver.pub',
        'GET /config-global.json',
        'GET /server.pub'
      ])
    }
  }
]
