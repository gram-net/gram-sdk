/** @format */
import axios from 'axios'
const baseUrl = 'https://api.blockcypher.com/v1/eth/main/'
const token = process.env.BLOCKCYPHER_APIKEY
const privateKey = process.env.ETH_PRIVKEY
const tetherContract = 'dac17f958d2ee523a2206206994597c13d831ec7'
const gasLimit = 20000
axios.defaults.headers = {
  'Content-Type': 'application/json'
}
export async function getApi(path: string) {
  const rurl = baseUrl + path

  return new Promise((resolve, reject) => {
    // ETIMEDOUT ENETUNREACH
    axios
      .get(rurl)
      .catch((e: any) => {
        console.error(e)
        reject(e)
      })
      .then(function (result: any) {
        if (!result || !result.data) {
          reject(new Error('API response invalid'))
        }
        console.warn(result.data)
        resolve(result.data)
      })
  })
}
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export async function postApi(path: string, data: any) {
  const rurl = baseUrl + path

  return new Promise((resolve, reject) => {
    // ETIMEDOUT ENETUNREACH
    axios
      .post(rurl, data)
      .catch((e: any) => {
        console.error(e)
        reject(e)
      })
      .then(function (result: any) {
        if (!result || !result.data) {
          reject(new Error('API response invalid'))
        }
        console.warn(result.data)
        resolve(result.data)
      })
  })
}

export const checkBalance = async function (address: string) {
  try {
    const url = `contracts/${tetherContract}/balanceOf?token=${token}`
    const data = {
      private: privateKey,
      gas_limit: gasLimit,
      params: [address]
    }
    const result: any = await postApi(url, data)
    return result
  } catch (e) {
    console.error(e)
    throw e
  }
}
export const getAddress = async function (address: string) {
  try {
    const result: any = await getApi('addrs/' + address)
    return result
  } catch (e) {
    console.error(e)
    throw e
  }
}
export const sendGift = async function (address: string, amount: string) {
  try {
    const url = `contracts/${tetherContract}/transfer?token=${token}`
    const data = {
      private: privateKey,
      gas_limit: gasLimit * 10,
      params: [address, parseInt(amount, 10) * 1000000]
    }
    const result: any = await postApi(url, data)
    return result
  } catch (e) {
    console.error(e)
    throw e
  }
}
