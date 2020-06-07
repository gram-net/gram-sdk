/** @format */

import { Request, Response } from 'express'
import { readFileSync } from 'fs'
export default [
  {
    method: 'get',
    path: '/server.pub',
    handler: async (request: Request, response: Response) => {
      response.write(readFileSync('/tmp/server.pub', 'binary'), 'binary')
      response.end(undefined, 'binary')
    }
  }
]
