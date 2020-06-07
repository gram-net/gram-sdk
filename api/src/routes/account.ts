/** @format */

import { Request, Response } from 'express'
import { callCppBackend, respond } from '../utilities/index.js'

export default [
  {
    method: 'get',
    path: '/account',
    handler: async (request: Request, response: Response) => {
      const account = request.query.id || request.query.account || false
      let code
      let result
      if (!account) {
        code = 602
        result = 'account is empty'
      } else {
        const urlStruct = '/account?account=' + account
        code = 200
        result = await callCppBackend(urlStruct)
      }
      response.status(code).json(result)
    }
  }
]
