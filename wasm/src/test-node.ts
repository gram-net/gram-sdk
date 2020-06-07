/** @format */

// // WORKERS NOT WORKING BECAUSE NODE DOES NOT SUPPORT WORKERS IMPORTING AS ESNEXT
// import {
//   Worker, isMainThread, parentPort, workerData
// } from 'worker_threads';
// function parseJSAsync(script:string) {
//   console.log(script)
//   return new Promise((resolve, reject) => {
//     const worker = new Worker(script, {
//       workerData: undefined,
//       eval: true
//     });
//     worker.on('message', resolve);
//     worker.on('error', reject);
//     worker.on('exit', (code:any) => {
//       if (code !== 0)
//         reject(new Error(`Worker stopped with exit code ${code}`));
//     });
//   });
// };
// if(!isMainThread) { throw new Error("FOO") }

import { Func, Fift } from './wasm.js'
// import { until, sleep } from "./utils.js"
// import { newWallet, funcStdlib, simpleWalletCodeFc, Asmfif, TonUtilFif, ListsFif, Fiftfif } from './fixt-files.js'
import { readFileSync } from 'fs'
import crypto from 'crypto'

import TestWasm from './__tests__/test-wasm.js'

process.on('uncaughtException', (ex: any) => {
  console.error(ex)
  process.exit(6)
})
;(async () => {
  //readFileSync('./wasm/func.bin').buffer
  // readFileSync('./wasm/func.js.mem')
  const funcObj = new Func(readFileSync('./wasm/func.wasm'), undefined, undefined, crypto)
  //
  // readFileSync('./wasm/fift.bin').buffer,
  // readFileSync('./wasm/fift.js.mem'),
  const fiftObj = new Fift(readFileSync('./wasm/fift.wasm'), undefined, undefined, crypto)

  const test = new TestWasm({ funcObj, fiftObj })
  test.list()
  try {
    await test.runTest([
      'func-script-fail',
      'fift-script-fail',
      'fift-script-success',
      'func-script-success',
      'fift-interactive-success',
      'fift-interactive-fail'
    ])
    //   'tonlib-sendfile-fail',
    // 'tonlib-sendfile-success'])
    // 'func-interactive-success'])
    // await test.runAll()
    // await test.runTest([,])
    test.list()
  } catch (e) {
    console.error(e)
  }
})()
