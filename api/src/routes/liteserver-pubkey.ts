/** @format */

import { Request, Response } from 'express'
import { readFileSync } from 'fs'
export default [
  {
    method: 'get',
    path: '/liteserver.pub',
    handler: async (request: Request, response: Response) => {
      response.write(readFileSync('/tmp/liteserver.pub', 'binary'), 'binary')
      response.end(undefined, 'binary')
    }
  }
]
