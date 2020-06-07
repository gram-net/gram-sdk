/** @format */

import axios, { AxiosResponse, AxiosRequestConfig } from 'axios'

export type AddressState = 'frozen' | 'uninitialized'

export interface Transaction {
  lt: number
  hash: string
}

export interface AddressInformation {
  state: AddressState
  balance: number
  previous_transaction?: Transaction
}

export interface SuccesData<Result> {
  ok: true
  result: Result
}

export interface ErrorData {
  ok: false
  code: 400 | 200 | 500
  description: string
}

export type ResponseSuccess<Result> = AxiosResponse<SuccesData<Result>>
export type ResponseError = AxiosResponse<ErrorData>
export type Response<Result> = ResponseSuccess<Result> | ResponseError

// API
const proxy = 'https://cors-anywhere.herokuapp.com/'
const TonApi = 'https://api.ton.sh'
const ApiBase = proxy + TonApi

const fetchJson = async (endpoint: string, data?: { [key: string]: any }) => {
  const config: AxiosRequestConfig = {
    headers: {
      'Content-Type': 'application/json'
    }
  }
  try {
    const res = await axios.post(endpoint, JSON.stringify(data), config)
    return res as Response<any>
  } catch (error) {
    return error as Response<any>
  }
}

export const getAddressInformation = async (address: string) => {
  const endpoint = `${ApiBase}/getAddressInformation?address=${address}`
  const data: Response<AddressInformation> = await fetchJson(endpoint)
  return data
}

export const getTransactions = async (
  address: string,
  limit?: number,
  lt?: number,
  hash?: string
) => {
  const data = { address, limit, lt, hash }
  const endpoint = `${ApiBase}/getTransactions`
  const res: Response<Transaction[]> = await fetchJson(endpoint, data)
  return res
}

export const getAddressBalance = async (address: string) => {
  const endpoint = `${ApiBase}/getAddressBalance`
  const res: Response<number> = await fetchJson(endpoint, { address })
  return res
}

export const getAddressState = async (address: string) => {
  const endpoint = `${ApiBase}/getAddressState`
  const res: Response<AddressState> = await fetchJson(endpoint, { address })
  return res
}

export const unpackAddress = async (address: string) => {
  const endpoint = `${ApiBase}/unpackAddress`
  const res: Response<string> = await fetchJson(endpoint, { address })
  return res
}

export const packAddress = async (address: string) => {
  const endpoint = `${ApiBase}/packAddress`
  const res: Response<string> = await fetchJson(endpoint, { address })
  return res
}

export const getServerTime = async () => {
  const endpoint = `${ApiBase}/getServerTime`
  const res: Response<number> = await fetchJson(endpoint)
  return res
}
