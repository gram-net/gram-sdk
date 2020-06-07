/** @format */

import { Request, Response } from 'express'
import { callCppBackend, respond } from '../utilities/index.js'

export default [
  {
    method: 'get',
    path: '/transaction',
    handler: async (request: Request, response: Response) => {
      const account = request.query.id || request.query.account || false
      const lt = request.query.lt || false
      const hash = request.query.hash || false
      let code, result
      if (!account || !lt || !hash) {
        code = 602
        if (!account) {
          result = 'account is empty'
        } else if (!lt) {
          result = 'lt is empty'
        } else if (!hash) {
          result = 'hash is empty'
        }
      } else {
        const urlStruct =
          '/transaction?account=' + account + '&lt=' + lt + '&hash=' + hash
        code = 200
        result = await callCppBackend(urlStruct)
      }
      response.status(code).json(result)
    }
  }
]
