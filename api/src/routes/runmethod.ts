/** @format */

import { Request, Response } from 'express'
import { LiteClient } from '../lite-client.js'

const lc = new LiteClient()

export default [
  {
    method: 'get',
    path: '/runmethod',
    handler: async (request: Request, response: Response) => {
      const account = request.query.account
      const method = request.query.method
      let code
      let result
      if (!account) {
        code = 602
        result = 'account is empty'
      } else {
        const result = await lc.runmethod(account as string, method as string)
        // console.warn(result)
        code = 200
      }
      response.status(code).json(result)
    }
  }
]
