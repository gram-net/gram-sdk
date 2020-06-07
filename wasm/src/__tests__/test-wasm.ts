/** @format */

import { Func, Fift, filesExp } from '../wasm.js'
import * as FIXT from '../fixt-files.js'
import { Test } from './~test.js'

export default class TestWasm extends Test {
  constructor(public imports: any) {
    super(imports)
  }
  fift = class {
    constructor(public parent: { imports: { fiftObj: Fift } }) {}
    script = {
      fail: async () => {
        const scriptFiles = [
          {
            name: 'new-wallet.fif',
            data: 'INVALID ``` FIFT'
          }
        ]
        const scriptArgs = ['-s', 'new-wallet.fif', '0', 'test-wallet']
        await this.parent.imports.fiftObj.exec(scriptFiles, scriptArgs, [
          'test-wallet.pk',
          'test-wallet-query.boc',
          'test-wallet.addr'
        ])
      },
      success: async () => {
        const scriptFiles = [
          {
            name: 'new-wallet.fif',
            data: FIXT.newWallet
          }
        ]
        const scriptArgs = ['-s', 'new-wallet.fif', '0', 'test-wallet']
        await this.parent.imports.fiftObj.exec(scriptFiles, scriptArgs, [
          'test-wallet.pk',
          'test-wallet-query.boc',
          'test-wallet.addr'
        ])
      }
    }
    interactive = {
      fail: async () => {
        await this.parent.imports.fiftObj.exec([], ['-i'], [], ['test-failure'])
      },
      success: async () => {
        await this.parent.imports.fiftObj.exec(
          [{ name: 'newwallet.fif', data: FIXT.newWallet }],
          [],
          [],
          ['<b 123456789 32 u, b> <s dup csr.', 'dup .s', 'dup csr.', 'quit']
        )
      }
    }
  }
  func = class {
    constructor(public parent: { imports: { funcObj: Func } }) {}
    script = {
      fail: async () => {
        const filesFail = [
          {
            name: 'stdlib',
            data: '````FAKE THE FUNC````'
          }
        ]
        await this.parent.imports.funcObj.exec(filesFail, ['-P'])
      },
      success: async () => {
        const filesSuccess = [
          {
            name: 'stdlib',
            data: FIXT.funcStdlib
          },
          {
            name: 'simple-wallet',
            data: FIXT.testfc
          }
        ]
        await this.parent.imports.funcObj.exec(filesSuccess, ['-P'])
      }
    }
  }
}
