/** @format */

import { UpdateType, Scene, Context } from './telegraf.js'
import bip39 from 'bip39-ts'
const { toSeedHex, validateMnemonic } = bip39
import nacl from 'tweetnacl'
import ed25519 from 'ed25519-hd-key'
const { getPublicKey, getMasterKeyFromSeed } = ed25519
import { tokensObj, BotTokens } from './tokens.js'

export type BotEventHandler = { command: typeof UpdateType | RegExp; handler: any }
export type ContextHandler = (ctx: typeof Context, next?: any) => void
export interface BotConfig {
  scenes: Array<typeof Scene>
  dbname: string
  botid: string
  cmdHandlers: BotEventHandler[]
  onHandlers: BotEventHandler[]
  actionHandlers: BotEventHandler[]
  hearsHandlers: BotEventHandler[]
  CustomContext: typeof Context
  onStart: ContextHandler
  inlineQuery: ContextHandler
  sendLocation: ContextHandler
  onHelp: ContextHandler
  onMessage: ContextHandler
}
export class Bot {
  tokens: BotTokens
  key: BotKey
  constructor(public botname: string, public config: BotConfig) {
    this.tokens = (tokensObj as any)[this.botname]
    this.key = new BotKey(this.tokens.mnemonic)
  }
}
export interface Bots {
  [key: string]: Bot
}
export class BotKey {
  public keypair: nacl.SignKeyPair
  public pubkey: Buffer
  constructor(private mnemonic: string) {
    const valid = validateMnemonic(mnemonic)
    if (!valid) {
      console.error(valid)
      throw new Error('Bot not configured, mnemonic invalid')
    }
    const seed = toSeedHex(mnemonic)
    const { key } = getMasterKeyFromSeed(seed)
    this.pubkey = getPublicKey(key)
    this.keypair = nacl.sign.keyPair.fromSeed(key)
    const signed = nacl.sign(Buffer.from('test_string'), this.keypair.secretKey)
    // console.warn('test signature', signed)
    console.warn('pub key', this.keypair.publicKey)
  }
}
