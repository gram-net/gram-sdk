/** @format */

import { saddr, nbaddr, baddr } from './parse.js'
import { until, sleep } from './utils.js'
import { Client } from './client.js'
import * as FIXT from './fixt-files.js'
import * as nacl from 'tweetnacl'

const bases = new Map()
const clients = new Map()

export interface AddressObj {
  saddr: string
  nbaddr: string
  baddr: string
  wc: string | number
  addrHex?: string
}

export interface AccountInfo {
  balance: number
  state: string
}

export class Account implements AddressObj {
  wc: string

  constructor(
    base: string,
    client: Client,
    public saddr: string,
    public nbaddr: string,
    public baddr: string
  ) {
    bases.set(this, base)
    clients.set(this, client)
    this.wc = saddr.split(':')[0]
  }

  get base() {
    return bases.get(this)
  }
  get client() {
    return clients.get(this)
  }

  static SCRIPT_NEW = FIXT.newWallet
  static SCRIPT_NEW_EXT = FIXT.newWalletExt
  static SCRIPT_SEND = FIXT.wallet
  static SCRIPT_WALLET_GEN_HASH = FIXT.walletGenHash
  static SCRIPT_WALLET_GEN_BOC = FIXT.walletGenBoc
  static SCRIPT_SHOW_ADDR = FIXT.showAddr

  static async create(
    wc: any,
    base: string,
    client: Client,
    script: string = Account.SCRIPT_NEW
  ) {
    // await client.fift.run(script, wc.toString(), base)
    return Account.load(base, client)
  }

  static async load(base: string, client: Client) {
    // const fiftResult: any = await client.fift.run(Account.SCRIPT_SHOW_ADDR, base)
    // console.warn(base, client, fiftResult)
    // console.warn(saddr(fiftResult.res), nbaddr(fiftResult.res), baddr(fiftResult.res))
    const fiftResult = { res: 'test' }
    return new Account(
      base,
      client,
      saddr(fiftResult.res),
      nbaddr(fiftResult.res),
      baddr(fiftResult.res)
    )
  }

  static fromAddressObj(base: string, addressObj: AddressObj, client: Client) {
    return new Account(
      base,
      client,
      addressObj.saddr,
      addressObj.nbaddr,
      addressObj.baddr
    )
  }

  static fromFiftRes(fiftRes: string, base: string, client: Client) {
    return new Account(base, client, saddr(fiftRes), nbaddr(fiftRes), baddr(fiftRes))
  }
  async info() {
    const result: AccountInfo = await this.client.getaccount(this.baddr)
    return result
  }

  async txs() {
    const result = await this.client.txs(this.baddr)
    return result
  }

  async deploy(deployFile?: any) {
    const result1 = await this.client.last()

    const testgiverAddr = 'kf9mZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZnw8'

    const result = await this.client.runmethod(testgiverAddr, 'seqno')
    const testgiverSeqNo = Number(result)
    // console.warn("TESTGIVER SEQNO", {testgiverSeqNo})

    const bocPath = '/testgiver-zerostate-' + new Date().getTime()

    const fiftResultB: any = 'test'
    return fiftResultB
  }
}
