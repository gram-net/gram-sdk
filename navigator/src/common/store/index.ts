/** @format */

import { NotificationOptions } from '@/common/models/notification'
import { createDirectStore } from 'direct-vuex'
import Vue from 'vue'
import Vuex from 'vuex'
import Common, { CommonState } from './Common'
import GramWasm, { GramWasmState } from './GramWasm/GramWasm'
import Wallet, { WalletState } from './Wallet/Wallet'
import TappletLauncher, { TappletLauncherState } from './TappletLauncher/TappletLauncher'
import { NOTIFY, NotifyResult } from './Common/Notifications'
import Console, { ConsoleState } from './Console'
import Lotton, { LottonState } from '@/apps/lotton/store'
Vue.use(Vuex)

const {
  store,
  rootActionContext,
  moduleActionContext,
  rootGetterContext,
  moduleGetterContext
} = createDirectStore({
  modules: {
    Common,
    GramWasm,
    Wallet,
    TappletLauncher,
    Console,
    Lotton
  }
})

// Export the direct-store instead of the classic Vuex store.
export default store

// The following exports will be used to enable types in the
// implementation of actions and getters.
export { rootActionContext, moduleActionContext, rootGetterContext, moduleGetterContext }

// The following lines enable types in the injected store '$store'.
export type RootStore = typeof store

declare module 'vuex' {
  interface Store<S> {
    direct: RootStore
  }
}

export interface RootState {
  Common: CommonState
  GramWasm: GramWasmState
  Wallet: WalletState
  TappletLauncher: TappletLauncherState
  Console: ConsoleState
  Lotton: LottonState
}

export const notify = (options: NotificationOptions): NotifyResult =>
  store.original.dispatch('Common/Notifications/' + NOTIFY, options)
