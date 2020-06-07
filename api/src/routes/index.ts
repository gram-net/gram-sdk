/** @format */

import root from './root.js'
import last from './last.js'
import liteserverPubkey from './liteserver-pubkey.js'
import consolePubkey from './console-pubkey.js'
import configGlobal from './global-config-json.js'
import status from './status.js'
import account from './account.js'
import transaction from './transaction.js'
import transactions from './transactions.js'
import runmethod from './runmethod.js'
import sendfile from './sendfile.js'

export default [
  ...root,
  ...last,
  ...configGlobal,
  ...liteserverPubkey,
  ...consolePubkey,
  ...status,
  ...account,
  ...transaction,
  ...transactions,
  ...sendfile,
  ...runmethod
]
