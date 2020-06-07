/** @format */

import axios, { AxiosResponse, AxiosRequestConfig, AxiosPromise } from 'axios'
import { until } from './utils.js'
import * as FIXT from './fixt-files.js'

import nacl from 'tweetnacl'
const nacl_sign = nacl.sign

import FormData from 'form-data'
import {
  mapTransactions,
  TransactionResponse,
  Transaction
} from './models/transaction.js'

export type AddressState = 'frozen' | 'uninitialized'

export class Client {
  autoLast: boolean
  timer: any
  remote = true

  blobFromBuffer = (buffer: Uint8Array) => new Blob([new Uint8Array(buffer).buffer])

  constructor(autoLast = false) {
    this.autoLast = autoLast
  }

  // API
  gramuri = process.env.GRAM_API_URI || 'http://localhost'
  gramport = process.env.GRAM_API_PORT || 8084
  ApiBase = `${this.gramuri}:${this.gramport}`

  timerFunc(msg: string, timeout = 20000): void {
    // console.info(msg)
    this.timer = setTimeout(async () => {
      console.error('ClientRemote TIMEOUT', msg, timeout)
      throw new Error(msg)
    }, timeout)
  }

  async destroy() {
    clearTimeout(this.timer)
  }

  async fetchJson<T = any>(url: string, data?: { [key: string]: any }) {
    const config: AxiosRequestConfig = {
      method: 'get',
      url,
      data,
      headers: {
        'Content-Type': 'application/json'
      }
    }
    // console.warn(endpoint, JSON.stringify(data), config)
    return axios(config) as AxiosPromise<T>
  }

  async last() {
    const endpoint = `${this.ApiBase}/last`
    const data = await this.fetchJson(endpoint)
    return data
  }

  /**
   *
   * @param baddr wallet address format `baddr`
   */
  async txs(baddr: string): Promise<AxiosResponse<Transaction[]>> {
    const endpoint = `${this.ApiBase}/transactions?account=${baddr}`
    const res = await this.fetchJson<TransactionResponse[]>(endpoint)
    if (res.data && res.status === 200) {
      ;((res.data as any) as Transaction[]) = mapTransactions(res.data)
    }
    return (res as any) as AxiosResponse<Transaction[]>
  }

  async sleep(ms = 2500) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms)
    })
  }

  async waitInfoChange(account: string, param: string, oldValue: any) {
    console.warn('waitInfoChange', { param, oldValue })
    return await until(async (resolve: any, reject: any) => {
      // let last = await this.last()
      // console.warn("LAST?", last)
      const info: any = await this.getaccount(account)
      // console.warn('waitInfoChange', { info })
      if (info[param] !== oldValue) {
        console.warn('waitInfoChange complete', { info, param, oldValue })
        resolve()
      }
      await this.sleep()
    })
  }

  async getaccount(address: string) {
    const endpoint = `${this.ApiBase}/getaccount?address=${address}`
    const response = await this.fetchJson(endpoint)
    // console.warn("GOT ACCOUNT DATA", response.data)
    return response.data
  }

  async block(block: string) {
    const endpoint = `${this.ApiBase}/block?block=${block}`
    const res = await this.fetchJson(endpoint)
    return res
  }

  async sendFile(file: any) {
    const form = new FormData()
    // console.warn(typeof file, file)
    if (typeof file === 'string') {
      throw Error("Can't use FS")
      // form.append("bocFile", createReadStream(file));
    } else {
      form.append('bocFile', this.blobFromBuffer(file), {
        filename: 'fileBuffer'
      })
    }
    // console.warn("sendFile form", form)
    const headers = typeof form.getHeaders === 'function' ? form.getHeaders() : {}

    const endpoint = `${this.ApiBase}/sendFile`
    const config: AxiosRequestConfig = { headers }
    return axios
      .post(endpoint, form, config)
      .then((response: any) => {
        this.destroy()
        return response.data
      })
      .catch((e: any) => {
        this.destroy()
        throw e
      })
  }

  async runmethod(address: string, method: string) {
    const data = { address, method }
    const endpoint = `${this.ApiBase}/runmethod`
    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'application/json'
      }
    }
    return axios
      .post(endpoint, data, config)
      .then((response: any) => {
        this.destroy()
        return response.data
      })
      .catch((e: any) => {
        this.destroy()
        throw e
      })
  }
}
