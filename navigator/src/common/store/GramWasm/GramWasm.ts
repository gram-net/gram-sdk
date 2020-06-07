/** @format */

import { Module } from 'vuex'
import { RootState } from '@/common/store'
import { FIXT, Client, Account, Func, Fift } from '@gram-net/wasm'

export interface GramWasmState {
  fiftObj: Fift
  funcObj: Func
  fiftObjAsync: Fift
  funcObjAsync: Func
  account: typeof Account
  client: Client
}
export { FIXT }

import crypto from 'crypto'

let useWasm = true

let fiftObj, fiftObjAsync, funcObj, funcObjAsync
;async () => {
  // TODO , why don't these work?
  if (typeof window === 'object' && window.hasOwnProperty('cordova')) {
    // if (typeof window.cordova == "object") {
    useWasm = false
    // }
    // var devicePlatform = device.platform;
    // if (devicePlatform === "iOS") {
    // }
  }
  if (useWasm) {
    const fiftWasmFetch = await fetch('./wasm/fift.wasm')
    const fiftWasm = await fiftWasmFetch.arrayBuffer()

    const funcWasmFetch = await fetch('./wasm/func.wasm')
    const funcWasm = await funcWasmFetch.arrayBuffer()

    funcObj = new Func(funcWasm, undefined, undefined, crypto)
    fiftObj = new Fift(fiftWasm, undefined, undefined, crypto)
    funcObjAsync = funcObj
    fiftObjAsync = fiftObj
  } else {
    const fiftBinFetch = await fetch('./wasm/fift.bin')
    const fiftBin = await fiftBinFetch.arrayBuffer()

    const funcBinFetch = await fetch('./wasm/func.bin')
    const funcBin = await funcBinFetch.arrayBuffer()

    const fiftMemFetch = await fetch('./wasm/fift.js.mem')
    const fiftMem = await fiftMemFetch.arrayBuffer()

    const funcMemFetch = await fetch('./wasm/func.js.mem')
    const funcMem = await funcMemFetch.arrayBuffer()

    const fiftAsyncMemFetch = await fetch('./wasm/fiftasync.js.mem')
    const fiftAsyncMem = await fiftAsyncMemFetch.arrayBuffer()

    const funcAsyncMemFetch = await fetch('./wasm/funcasync.js.mem')
    const funcAsyncMem = await funcAsyncMemFetch.arrayBuffer()

    funcObjAsync = new Func(undefined, funcBin, funcAsyncMem, crypto)
    fiftObjAsync = new Fift(undefined, fiftBin, fiftAsyncMem, crypto)

    funcObj = new Func(undefined, undefined, funcMem, crypto)
    fiftObj = new Fift(undefined, undefined, fiftMem, crypto)
  }
}
const mod = {
  state: {
    fiftObj,
    fiftObjAsync,
    funcObj,
    funcObjAsync,
    FIXT,
    account: Account,
    client: new Client()
  },
  modules: {},
  namespaced: true
}

export default mod
