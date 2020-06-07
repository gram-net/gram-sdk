/** @format */

import { Module, ActionTree, MutationTree, GetterTree } from 'vuex'
import { RootState } from '@/common/store'

export interface NavBarState {
  drawerOpen: boolean
  tab: string
}

const state: NavBarState = {
  drawerOpen: false,
  tab: 'tab-list'
}

const getters: GetterTree<NavBarState, RootState> = {}

const mutations: MutationTree<NavBarState> = {
  setDrawer(state, options: { value: boolean; tab?: string }) {
    state.drawerOpen = options.value
    if (options.tab) {
      state.tab = options.tab
    }
  },
  setTab(state, tab: string) {
    state.tab = tab
  }
}

const actions = {}

const mod = {
  state,
  getters,
  mutations,
  actions,
  namespaced: false
}

export default mod
