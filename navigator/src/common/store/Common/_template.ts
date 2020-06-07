/** @format */

import { defineModule, defineActions, defineMutations, defineGetters } from 'direct-vuex'
import { moduleActionContext } from '@/common/store'

export interface FooState {}

const state: FooState = {}

const getters = defineGetters<FooState>()({})

const mutations = defineMutations<FooState>()({})

const actions = defineActions({
  foo(ctx) {
    const { commit, rootState, dispatch } = moduleCtx(ctx)
  }
})

const mod = defineModule({
  state,
  getters,
  mutations,
  actions,
  namespaced: false
})

const moduleCtx = (context: any) => moduleActionContext(context, mod)

export default mod
