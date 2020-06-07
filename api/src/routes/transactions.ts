/** @format */

import { Request, Response } from 'express'
import { callCppBackend, respond } from '../utilities/index.js'
import { Account } from '../models/account.model.js'

export default [
  {
    method: 'get',
    path: '/transactions',
    handler: async (request: Request, response: Response) => {
      const account = request.query.id || request.query.account || false
      let code
      let result
      if (!account) {
        code = 602
        result = 'account is empty'
      } else {
        const urlStructAcc = '/account?account=' + account
        const resultAccTrans: Account = (await callCppBackend(urlStructAcc).catch(
          (error) => {
            console.log(error)
          }
        )) as Account
        try {
          if (resultAccTrans && resultAccTrans.last_transaction) {
            const transaction = resultAccTrans.last_transaction
            const urlStruct =
              '/transactions?account=' +
              transaction.account +
              '&lt=' +
              transaction.lt +
              '&hash=' +
              transaction.hash
            console.log('urlStruct', urlStruct)
            code = 200
            result = await callCppBackend(urlStruct).catch((error) => {
              console.log(error)
            })
          } else {
            code = 404
            result = 'account not found.' + resultAccTrans
          }
        } catch (e) {
          console.error(e)
          code = 500
          result = 'server error'
        }
      }
      response.status(code).json(result)
    }
  }
]
