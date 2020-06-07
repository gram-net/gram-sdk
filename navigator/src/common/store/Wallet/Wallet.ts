/** @format */

import randomstring from 'randomstring'
import { defineGetters, defineMutations } from 'direct-vuex'
import { defineModule, defineActions } from 'direct-vuex'
import { nanoFactor, symbol } from './../../lib/constants'
import { Network } from '@/common/models/network'
import { gram } from '@/common/lib/format'
import { notify } from '@/common/store'
import { moduleActionContext } from '@/common/store'
import { AddressObj, Account, AccountInfo } from '@gram-net/wasm'
import router from '@/router'
import { confirm, dialog } from '@/main'
import { setCache, getCache } from '@/common/lib/cache'
import { getKeys, naclSign, toSeedHex, getMnemonic } from '@/common/lib/bip44'
import { handleError, addTimeoutToPromise } from '@/common/lib/error-handling'
import { Transaction } from '@gram-net/wasm/dist/models/transaction'
import { initWallet } from './init-wallet'
import { encrypt, decrypt } from '@/common/lib/crypto'

export const getNextName = (word: string, names: string[]) => {
  const regEx = new RegExp(`\\b${word} \\b(\\d+)$`)
  const num = names
    .filter((name) => regEx.test(name))
    .map((name) => {
      const match = name.match(regEx)
      const i: string = (match as RegExpMatchArray)[1]
      return +i
    })

  const max = num.length > 0 ? Math.max(...num) : 0
  const name = `${word} ${max + 1}`
  return name
}
export const getAccount = (wallet: Wallet, client: any) => {
  return Account.fromAddressObj(wallet.id, wallet.addressObj, client)
}

export interface MasterKey {
  id: string
  /**
   * 12 word string
   */
  mnemonic: string
  name: string
}

export interface Wallet {
  masterKeyId?: string
  id: string
  name: string
  balance: number | string
  network: Network
  addressObj: AddressObj
  addrBuffer: Buffer
  transactions?: null | Transaction[]
  backedUp?: boolean
  color?: string
  /**
   * Date string ISO `new Date().toISOString()`
   */
  lastUsed: string
  imported?: boolean
  /**
   * Hex version of PrivateKey that gets used to create KeyPair
   */
  key: string
  path?: string
}

export interface PendingTransaction {
  amount: number | null
  fromAddr: string
  toAddr: string
  comment?: string
}

export interface WalletState {
  keystore: MasterKey[]
  wallets: Wallet[]
  /**
   * id of `Wallet`
   */
  wallet: string | null
  key: MasterKey | null
  // transactions: Transaction[];
  pendingTransaction: PendingTransaction | null
  transaction: null | Transaction
  networks: Network[]
  network: Network | null
  updating: boolean
  updatingAll: boolean
  forging: boolean
  sending: boolean
}

export interface CreateWalletOptions {
  key: MasterKey
  name?: string
  Uint8ArrayImport?: Uint8Array | Buffer
}

/**
 * @remark Syncs list of `state.keystore` to localstorage
 * @remark Syncs list of `state.wallets` to localstorage
 * @remark Syncs current `state.wallet` to localstorage
 * @remark Syncs current `state.key` to localstorage
 * @remark Syncs current `state.networks` to localstorage
 * @remark Syncs current `state.network` to localstorage
 */
export const syncCache = (state: WalletState) => {
  setCache('keystore', state.keystore)
  setCache('wallets', state.wallets)
  setCache('wallet', state.wallet)
  setCache('key', state.key)
  setCache('networks', state.networks)
  setCache('network', state.network)
  setCache('pendingTransaction', state.pendingTransaction)
}

const defaultNetworks: Network[] = [
  {
    id: 13371337,
    name: 'GRAM',
    RPCURL: 'https://thegram.org',
    chainID: -1,
    symbol,
    blockExplorerURL: 'https://thegram.org/explorer'
  },
  {
    id: 396,
    name: 'TON',
    RPCURL: 'https://ton.app',
    chainID: -1,
    symbol: '💎',
    blockExplorerURL: 'https://ton.app/explorer'
  }
]

const state: WalletState = {
  keystore: getCache<MasterKey[]>('keystore', []),
  wallet: getCache<null | string>('wallet', null),
  wallets: getCache<Wallet[]>('wallets', []),
  key: getCache<null | MasterKey>('key', null),
  pendingTransaction: getCache<null | PendingTransaction>('pendingTransaction', null),
  transaction: null,
  updating: false,
  updatingAll: false,
  forging: false,
  sending: false,
  networks: getCache<Network[]>('networks', defaultNetworks),
  network: getCache<Network>('network', defaultNetworks[0])
}

const getters = defineGetters<WalletState>()({
  wallet: (state) => state.wallets.find((w) => w.id === state.wallet) || null,
  usedAddresses: (state) => {
    const transactions = state.wallets
      .filter((w) => w.transactions && w.transactions.length > 0)
      .map((w) => w.transactions)
      .flat() as Transaction[]
    const mapped = transactions
      .filter((t) => t.type === 'send' && t.destination)
      .map((t) => t.destination) as string[]
    return [...new Set(mapped)]
  },
  walletsByParentKey: (state) =>
    state.keystore.map((key) => ({
      key,
      wallets: state.wallets.filter((w) => w.masterKeyId === key.id)
    })),
  walletsWithoutParentKey: (state) => {
    const other = state.wallets.filter(
      ({ masterKeyId }) =>
        !masterKeyId || state.keystore.map((k) => k.id).indexOf(masterKeyId) < 0
    )
    return other
  }
})

const mutations = defineMutations<WalletState>()({
  addNetwork: (state, network: Network) => {
    state.networks = [...state.networks, network]
    state.network = network
    syncCache(state)
  },
  removeNetwork: (state, network: Network) => {
    state.networks = state.networks.filter((n) => n.id !== network.id)
    if (state.network && state.network.id === network.id) {
      state.network = state.networks[0] || null
    }
    syncCache(state)
  },
  setNetwork: (state, network: Network | null) => {
    state.network = network
    syncCache(state)
  },
  setUpdating: (state, value: boolean) => (state.updating = value),
  setUpdatingAll: (state, value: boolean) => (state.updatingAll = value),
  setForging: (state, value: boolean) => (state.forging = value),
  setSending: (state, value: boolean) => (state.sending = value),
  setTransaction: (state, value: Transaction | null) => (state.transaction = value),
  removeWallet: (state, wallet: Wallet) => {
    state.wallets = state.wallets.filter((w) => w.id !== wallet.id)
    if (state.wallet && state.wallet === wallet.id) {
      state.wallet = null
    }
    syncCache(state)
  },
  patchWallet(state, payload: { id: string; update: Partial<Wallet> }) {
    const { id, update } = payload
    const wallets = state.wallets.map((wallet) => {
      if (wallet.id === id) {
        return {
          ...wallet,
          ...update
        }
      } else return wallet
    })
    state.wallets = [...wallets]
    syncCache(state)
  },
  setWallet: (state, wallet: Wallet | null = null) => {
    state.pendingTransaction = null
    if (!wallet) {
      state.wallet = null
    } else {
      const lastUsed = new Date().toISOString()
      const updatedWallet = {
        ...wallet,
        lastUsed
      }
      state.wallet = updatedWallet.id
      const found = state.wallets.find((w) => w.id === wallet.id)
      if (found) {
        found.lastUsed = lastUsed
        found.balance = wallet.balance
      }
    }
    syncCache(state)
  },
  setKey: (state, key: MasterKey | null = null) => {
    state.key = key
    syncCache(state)
  },
  setWallets: (state, wallets: Wallet[]) => {
    state.wallets = wallets
    syncCache(state)
  },
  setPendingTransaction: (state, transaction: PendingTransaction | null = null) => {
    state.pendingTransaction = transaction
    syncCache(state)
  },
  addWallet: (state, wallet: Wallet) => {
    if (
      state.wallets.find(
        (w) => w.id === wallet.id || wallet.addressObj.baddr === w.addressObj.baddr
      )
    )
      return
    state.wallets = [...state.wallets, wallet]
    if (!state.wallet) state.wallet = wallet.id
    syncCache(state)
  },
  addKey: (state, key: MasterKey) => {
    if (state.keystore.find((k) => k.id === key.id || k.mnemonic === key.mnemonic)) return
    state.keystore = [...state.keystore, key]
    syncCache(state)
  },
  removeKey: (state, key: MasterKey) => {
    state.wallets = state.wallets.filter((w) => w.masterKeyId !== key.id)
    state.keystore = state.keystore.filter((k) => key.id !== k.id)
    syncCache(state)
  }
})

const actions = defineActions({
  async getKey(ctx) {
    const { rootState } = moduleCtx(ctx)
    const keyData: MasterKey = {
      mnemonic: encrypt(getMnemonic('english', 12), rootState.Common.Login.pin as string),
      id: randomstring.generate(32),
      name: getNextName(
        'Key',
        state.keystore.map((k) => k.name)
      )
    }
    return keyData
  },
  async forgeWallet(ctx, settings: CreateWalletOptions) {
    const { rootState, state, commit } = moduleCtx(ctx)
    const pin = rootState.Common.Login.pin
    if (!pin) return router.push('/login-pin')
    if (state.forging) throw new Error('Busy forging wallet')
    commit.setForging(true)
    const { account, client } = rootState.GramWasm
    const { Uint8ArrayImport } = settings
    const id = randomstring.generate({
      length: 9,
      charset: 'numeric'
    })
    let path: string | undefined = `m/44'/${(state.network as Network).id}'/${id}'`
    const hexSeed = toSeedHex(decrypt(settings.key.mnemonic, pin))
    const keys = getKeys(hexSeed, path)
    let keypair = keys.keypair
    let key: Uint8Array | Buffer = keys.key
    commit.setKey(settings.key)
    if (!state.network) throw new Error('No network selected')
    try {
      if (Uint8ArrayImport) {
        key = Uint8ArrayImport
        keypair = naclSign.keyPair.fromSeed(key)
        path = undefined
      }
      const options = {
        workchain: state.network.chainID,
        privateKey: keypair.secretKey,
        publicKey: keypair.publicKey,
        hashBuffer: initWallet
      }
      // const { addressObj, addrBuffer } = (await client.forgeaccount(
      //   options
      // )) as {
      //   addressObj: AddressObj;
      //   addrBuffer: Buffer;
      // };
      // const addrHex = Buffer.from((addrBuffer as any).data, "hex")
      //   .toString("hex")
      //   .slice(0, 64)
      //   .toUpperCase();
      // const thisAccount = account.fromAddressObj(id, addressObj, client);
      // const info: AccountInfo = await thisAccount.info();
      // let wallet: Wallet = {
      //   masterKeyId: settings.key.id,
      //   id,
      //   name:
      //     settings.name ||
      //     getNextName(
      //       "Wallet",
      //       state.wallets.map(w => w.name)
      //     ),
      //   balance: info.balance,
      //   network: state.network,
      //   imported: !!Uint8ArrayImport,
      //   addressObj: {
      //     ...addressObj,
      //     addrHex
      //   },
      //   addrBuffer,
      //   key: encrypt(key.toString("hex"), pin),
      //   lastUsed: new Date(1970).toISOString(),
      //   path
      // };
      // let text = `Successfully ${
      //   settings.Uint8ArrayImport ? "Imported" : "Created"
      // } ${wallet.name}`;
      // const exists = state.wallets.find(
      //   w => w.id === id || w.addressObj.baddr === addressObj.baddr
      // );
      // if (exists) {
      //   wallet = {
      //     ...exists,
      //     balance: info.balance
      //   };
      //   text = `${wallet.name} already exists`;
      // }
      // commit.addWallet(wallet);
      // commit.setWallet(wallet);
      // commit.setForging(false);

      // // force backup when one empty key;
      // const forceBackup =
      //   !wallet.imported &&
      //   state.keystore.length === 1 &&
      //   state.wallets.filter(w => w.masterKeyId === wallet.masterKeyId)
      //     .length === 1;
      // console.log({ forceBackup });
      // if (forceBackup) {
      //   router.push("/login-pin?redirect=/wallet/backup?redirect=/wallet");
      // } else {
      //   router.push("/wallet");
      // }

      // notify({
      //   text,
      //   type: "success",
      //   duration: 3000
      // });
      // return wallet;
    } catch (error) {
      const text =
        typeof error === 'string'
          ? error
          : typeof error === 'object' && (error.isAxiosError || error.message)
          ? error.message
          : "Couldn't import Wallet"
      handleError(error, text, 6000)
      commit.setForging(false)
    }
  },
  /**
   * @takes `state.pendingTransaction: Transaction` from store and sends it
   * @returns Promise<void>
   */
  async send(ctx) {
    const { commit, getters, rootState } = moduleCtx(ctx)
    const transaction = state.pendingTransaction
    if (state.sending) throw new Error('Already sending')
    if (!transaction || !transaction.amount) throw new Error('Amount requird')
    try {
      const { wallet } = getters
      commit.setSending(true)
      if (!wallet || !transaction) return
      const account = await getAccount(wallet, rootState.GramWasm.client)
      const key = Buffer.from(
        decrypt(wallet.key, rootState.Common.Login.pin as string),
        'hex'
      )
      const keypair = naclSign.keyPair.fromSeed(key)
      // await account.sendExternal(
      //   keypair,
      //   wallet.addrBuffer,
      //   transaction.toAddr,
      //   transaction.amount / nanoFactor
      // );
      // return result as any;
    } catch (error) {
      handleError(error, `Couldn't send ${symbol}`)
    } finally {
      commit.setSending(false)
    }
  },
  /**
    * @updates `state.wallet: Wallet` and `state.wallets: Wallet[]` with latest `AccountInfo` from the server
    * @remarks
    *  * If currently updating it doesn't run, but we're polling for updates every x minutes. So the wallets will be up-to-date anyhow.
    *  * If a change is found it notifies the user of the changes ammount, new old balance
      @returns `Promise<Wallet[]>`
    */
  async updateWallets(ctx) {
    const { commit, dispatch, state } = moduleCtx(ctx)
    if (state.updatingAll) return
    commit.setUpdatingAll(true)
    const promises = state.wallets.map((w) => dispatch.updateBalance(w.id))
    try {
      await Promise.all(promises)
    } catch (error) {
      console.warn("Couldn't update all wallets", error)
    } finally {
      commit.setUpdatingAll(false)
    }
  },

  async updateWallet(ctx, walletId: string | null): Promise<void> {
    const { state, dispatch, commit } = moduleCtx(ctx)
    if (state.updating) return
    commit.setUpdating(true)
    const id = walletId || state.wallet
    const wallet = state.wallets.find((w) => w.id === id)
    if (!wallet) throw new Error("Wallet doesn't exist")
    const infoPromise = dispatch.updateBalance(id)
    const txPromise = dispatch.updateTx(id)

    txPromise.catch((error) => {
      console.log(`Couldn't update txs ${wallet.name}`, error)
    })

    try {
      await await infoPromise
    } catch (error) {
      console.log(`Couldn't update balance ${wallet.name}`, error)
    } finally {
      commit.setUpdating(false)
    }
  },

  async updateBalance(ctx, walletId: string | null): Promise<number> {
    const { commit, state, rootState } = moduleCtx(ctx)
    const id = walletId || state.wallet
    const wallet = state.wallets.find((w) => w.id === id)
    if (!wallet) throw new Error("Wallet doesn't exist")
    const acct: Account = await getAccount(wallet, rootState.GramWasm.client)
    const info: AccountInfo = await acct.info()
    if (+wallet.balance !== +info.balance) {
      let change = +info.balance - +wallet.balance
      const type: 'send' | 'received' = change < 0 ? 'send' : 'received'
      change = type === 'send' ? change * -1 : change // Make the balance always a positive number
      const text = `${wallet.name} ${type} ${gram(change, true, wallet.network.symbol)}`
      notify({
        text,
        duration: 5000,
        type: type === 'send' ? 'info' : 'success'
      })
    }
    commit.patchWallet({
      id: wallet.id,
      update: {
        balance: info.balance
      }
    })
    return info.balance
  },
  async updateTx(ctx, walletId: string | null): Promise<Transaction[]> {
    const { commit, state, rootState } = moduleCtx(ctx)
    const id = walletId || state.wallet
    const wallet = state.wallets.find((w) => w.id === id)
    if (!wallet) throw new Error("Wallet doesn't exist")
    const tx = await rootState.GramWasm.client.txs(wallet.addressObj.baddr)
    commit.patchWallet({
      id: wallet.id,
      update: {
        transactions: tx.data
      }
    })
    return tx.data
  },
  async removeWallet(ctx, wallet: Wallet) {
    const { commit, dispatch } = moduleCtx(ctx)
    const confirmed = await confirm(
      `Are you sure you want to remove ${wallet.name}? Make sure that you have backed it up. Otherwise you might lose your funds. This action cannot be undone.`,
      {
        title: `Remove ${wallet.name}`
      }
    )
    if (!confirmed) return
    const result = await dialog.prompt({
      title: `Type REMOVE to remove ${wallet.name}`,
      actions: {
        false: 'Cancel',
        true: 'Confirm'
      }
    })
    if (result === false) return
    else if (result === 'REMOVE') {
      commit.removeWallet(wallet)
      router.push('/wallets').catch()
    } else dispatch.removeWallet(wallet)
  },
  async removeKey(ctx, key: MasterKey) {
    const { commit, dispatch } = moduleCtx(ctx)
    const confirmed = await confirm(
      `Are you sure you want to remove ${key.name} and all its containing wallets? Make sure that you have backed it up. Otherwise you might lose your funds. This action cannot be undone.`,
      {
        title: `Remove ${key.name}`
      }
    )
    if (!confirmed) return
    const result = await dialog.prompt({
      title: `Type REMOVE to remove ${key.name}`,
      type: 'error',
      actions: {
        false: 'Cancel',
        true: 'Confirm'
      }
    })
    if (result === false) return
    else if (result === 'REMOVE') {
      commit.removeKey(key)
      router.push('/wallets')
    } else dispatch.removeKey(key)
  }
})

const mod = defineModule({
  state,
  getters,
  mutations,
  actions,
  namespaced: true
})

export default mod

const moduleCtx = (context: any) => moduleActionContext(context, mod)
