/** @format */

import { Request, Response } from 'express'
import { callCppBackend, respond } from '../utilities/index.js'

export default [
  {
    method: 'get',
    path: '/status',
    handler: async (request: Request, response: Response) => {
      callCppBackend('/status')
        .then((result) => {
          respond(response, result)
        })
        .catch((error) => {
          response.send(error)
        })
    }
  }
]
