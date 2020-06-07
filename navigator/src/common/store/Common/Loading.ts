/** @format */

import { defineActions, defineGetters, defineMutations, defineModule } from 'direct-vuex'
import { RootState, moduleActionContext, notify } from '@/common/store'

export interface LoadingState {
  loading: boolean
  loadingOverlay: boolean
  status: string | null
  timer: any
  delay: number
  /**
   * Set the redirect button with a button text  and url
   * @example tupal: `[text: string, url: string] | null`
   */
  redirectButton: [string, string] | null
  online: boolean
}

const defaultRedirectButton: LoadingState['redirectButton'] = ['Restart', '/']

const state: LoadingState = {
  loading: true,
  loadingOverlay: true,
  status: 'Loading…',
  timer: setTimeout(() => {
    const noop = true
  }, 0),
  delay: 0,
  redirectButton: null,
  online: true
}

const getters = defineGetters<LoadingState>()({
  getStatus: (state) => state.status,
  loading: (state) => state.loading
})

const mutations = defineMutations<LoadingState>()({
  startLoadingOverlay(state, value) {
    state.loading = true
    state.loadingOverlay = true
    state.status = value || 'Loading…'
  },
  setRedirectButton(state, value: LoadingState['redirectButton']) {
    state.redirectButton = value || null
  },
  startLoading(state, value) {
    state.loading = true
    state.status = value || 'Loading…'
  },
  setOnline(state, value) {
    state.online = value
  },
  stopLoading: (state) => {
    state.loading = true
    state.loadingOverlay = true
    state.status = 'Success!'
    clearTimeout(state.timer)

    state.timer = setTimeout(() => {
      state.loading = false
      state.loadingOverlay = false
      state.status = null
    }, state.delay)
  },
  clearTimer: (state) => {
    clearTimeout(state.timer)
  },
  setLoadingStatus: (state, value) => {
    state.status = value
  },
  setTimer: (state, value) => {
    state.timer = value
  }
})

const actions = defineActions({
  startLoading: (ctx, opts) => {
    const { commit } = moduleCtx(ctx)
    const { command } = opts || { command: 'startLoading' }
    const { value } = opts

    commit.clearTimer()
    ctx.commit(command, value)
    commit.setRedirectButton(null)
    commit.setTimer(
      setTimeout(() => {
        const text =
          'This is taking longer than usual. Please restart the app or contact us if this problem persists.'
        commit.setRedirectButton(defaultRedirectButton)
        ctx.commit(command, text)
        notify({ text, type: 'error' })
      }, 10000)
    )
  }
})

const loadingModule = defineModule({
  state,
  getters,
  mutations,
  actions,
  namespaced: false
})

const moduleCtx = (context: any) => moduleActionContext(context, loadingModule)

export default loadingModule
