/** @format */

import { derivePath, getMasterKeyFromSeed, getPublicKey } from 'ed25519-hd-key'
import { sign as naclSign } from 'tweetnacl'
import { toSeedHex, getMnemonic, validateMnemonic } from 'bip39-ts'

interface GeneratedKeys {
  privateKey: string
  publicKey: string
  hexSeed: string
  path?: string | null
  keypair: nacl.SignKeyPair
  key: Buffer
}

const getKeys = (hexSeed: string, path?: string | null): GeneratedKeys => {
  const { key } = path ? derivePath(path, hexSeed) : getMasterKeyFromSeed(hexSeed)

  const keys = {
    hexSeed,
    path,
    key,
    privateKey: key.toString('hex'),
    publicKey: getPublicKey(key).toString('hex'),
    keypair: naclSign.keyPair.fromSeed(key)
  }
  return keys
}

export {
  getKeys,
  GeneratedKeys,
  derivePath,
  getMasterKeyFromSeed,
  getPublicKey,
  naclSign,
  toSeedHex,
  getMnemonic,
  validateMnemonic
}
