/** @format */

import { handleError } from '../../lib/error-handling'
import { encrypt, decrypt } from '../../lib/crypto'
import {
  defineModule,
  // defineActions,
  defineMutations,
  defineGetters,
  defineActions
} from 'direct-vuex'
import { getCache, setCache } from '@/common/lib/cache'
import { moduleActionContext } from '..'
// import { moduleActionContext } from "@/common/store";

import Vue from 'vue'
export const PinEventBus = new Vue()

export interface LoginState {
  pinCreated: string
  pin: string | null
  auth: boolean
  pinDialog: boolean
  pinDialogForm: string
}

const state: LoginState = {
  pinCreated: getCache('pinCreated', ''),
  pinDialogForm: '',
  pin: null,
  pinDialog: false,
  auth: false
}

const getters = defineGetters<LoginState>()({})

const mutations = defineMutations<LoginState>()({
  setPin: (state, pin: string) => {
    state.pin = pin
  },
  setPinDialogForm: (state, pin: string) => {
    state.pinDialogForm = pin
  },
  setAuth: (state, auth: boolean) => {
    state.auth = auth
  },
  setPinDialog: (state, val: boolean) => {
    state.pinDialog = val
    if (!val) {
      state.pinDialogForm = ''
      PinEventBus.$emit('close')
    }
  },
  clearPinDialog: (state) => {
    state.pinDialog = false
    state.pinDialogForm = ''
  },
  setCreated: (state, pin: string | null) => {
    state.pinCreated = !pin ? '' : encrypt('gram-net', pin as string)
    setCache('pinCreated', state.pinCreated)
  }
})

const actions = defineActions({
  async create(ctx, pin: string): Promise<boolean | void> {
    const { state, commit, dispatch } = moduleCtx(ctx)
    const valid = pin.length === 6
    if (!valid) throw new Error('PIN must be 6 numbers')
    commit.setCreated(pin)
    await dispatch.login(pin)
  },
  async login(ctx, pin: string): Promise<string> {
    const { state, commit } = moduleCtx(ctx)
    try {
      const loggedin = decrypt(state.pinCreated, pin) === 'gram-net'
      commit.setPin(pin)
      commit.setAuth(loggedin)
      return pin
    } catch (error) {
      commit.setAuth(false)
      throw new Error('Not authorized. Try again')
    }
  },
  promptPin(ctx) {
    const { rootState, commit, dispatch } = moduleCtx(ctx)
    commit.setPinDialog(true)
    return new Promise((res, rej) => {
      const submitHandler = async (pin: string) => {
        try {
          const validPin = await dispatch.login(pin)
          commit.clearPinDialog()
          res(validPin)
        } catch (error) {
          handleError(error, 'Wrong PIN', 600)
          return dispatch.promptPin()
        } finally {
          commit.setPinDialogForm('')
          destroy()
        }
      }
      const closeHandler = () => {
        destroy()
        rej('cancelled')
      }

      const destroy = () => {
        PinEventBus.$off('submit', submitHandler)
        PinEventBus.$off('close', closeHandler)
        commit.setPinDialogForm('')
      }

      PinEventBus.$on('submit', submitHandler)
      PinEventBus.$on('close', closeHandler)
    })
  }
})

const loginModule = defineModule({
  state,
  getters,
  mutations,
  actions,
  namespaced: true
})

const moduleCtx = (context: any) => moduleActionContext(context, loginModule)

export default loginModule
