/** @format */

import { Request, Router, Response } from 'express'
import axios from 'axios'
import { environment } from '../config.js'

export function respondOK(request: Request) {
  return request.method + ' ' + request.url + ' [OK]'
}

export async function respond(response: any, result: any) {
  return await response.status(200).json(result)
}

export async function callCppBackend(path: string) {
  const rurl = environment.CPP.URL + ':' + environment.CPP.PORT + path
  console.warn('CALL CPP URL', rurl)

  return new Promise((resolve, reject) => {
    // ETIMEDOUT ENETUNREACH
    axios
      .get(rurl)
      .catch((e: any) => {
        console.error(e)
        reject(e)
      })
      .then(function (result: any) {
        // console.warn(result.data)
        resolve(result.data)
      })
  })
}
