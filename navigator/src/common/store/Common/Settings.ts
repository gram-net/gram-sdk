/** @format */

import { defineModule, defineActions, defineMutations, defineGetters } from 'direct-vuex'
import { getCache, setCache } from '@/common/lib/cache'
import { moduleActionContext } from '@/common/store'
import { vuetify } from '@/main'

export type Theme = 'dark' | 'light'
export type Mode = 'help' | 'expert' | 'default'

export interface SettingsState {
  mode: Mode
  theme: Theme
}

const state: SettingsState = {
  theme: getCache('theme', 'dark'),
  mode: getCache('mode', 'default')
}

const getters = defineGetters<SettingsState>()({
  // [key]: val,
})

const mutations = defineMutations<SettingsState>()({
  setMode: (state, mode: Mode) => {
    state.mode = mode
    setCache('mode', mode)
  },
  setTheme: (state, theme: Theme) => {
    state.theme = theme
    vuetify.framework.theme.dark = theme === 'dark'
    setCache('theme', theme)
  }
})

const actions = defineActions({
  toggleMode: (ctx) => {
    const { commit } = moduleCtx(ctx)
    commit.setMode(state.mode === 'default' ? 'expert' : 'default')
  },
  toggleTheme: (ctx) => {
    const { commit } = moduleCtx(ctx)
    commit.setTheme(state.theme === 'dark' ? 'light' : 'dark')
  },
  initTheme: () => {
    vuetify.framework.theme.dark = state.theme === 'dark'
  }
})

const settingsModule = defineModule({
  state,
  getters,
  mutations,
  actions,
  namespaced: true
})

const moduleCtx = (context: any) => moduleActionContext(context, settingsModule)

export default settingsModule
