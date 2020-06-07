/** @format */

import { RootState } from '@/common/store'
import { Ticket } from './../models/ticket'
import { Wallet } from './../models/wallet'
import { getLottery, getAccount, buyTicket, getWinners } from './../api/api'
import { Lottery } from './../models/lottery'
import { Module, ActionTree, MutationTree, GetterTree } from 'vuex'

export interface LottonState {
  loading: boolean
  lottery?: Lottery
  account?: Wallet[]
  ticket?: Ticket
  wallet?: Wallet
  winners?: Ticket[]
}

const state: LottonState = {
  lottery: undefined,
  account: [],
  ticket: undefined,
  wallet: undefined,
  winners: [],
  loading: true
}

const mutations: MutationTree<LottonState> = {
  setAccount: (state, value: Wallet[]) => (state.account = value),
  setLottery: (state, value: Lottery) => (state.lottery = value),
  setWinners: (state, value: Ticket[]) => (state.winners = value),
  setTicket: (state, value: Ticket) => (state.ticket = value),
  setLoading: (state, value: boolean) => (state.loading = value),
  setWallet: (state, id: string) =>
    (state.wallet = (state.account || []).find((w) => w.id === id))
}

const actions = {
  async getAccount({ commit }) {
    const account = await getAccount()
    const first = account.map((w) => w.id).find((_, i) => i === 0)
    commit('setAccount', account)
    commit('setWallet', first)
  },
  async getLottery({ commit }, id: string) {
    const lottery = await getLottery(id)
    commit('setLottery', lottery)
  },
  async getWinners({ commit }) {
    const winners = await getWinners()
    commit('setWinners', winners)
  },
  async getTicket({ commit, state }, id: string) {
    const lottery = state.lottery || null
    let ticket: Ticket | undefined

    if (lottery) {
      ticket = (lottery.soldTickets || []).find((t) => t.id === id)
    }
    commit('setTicket', ticket)
  },
  async buyTicket({ commit, state }, ticket: Ticket) {
    const newTicket = await buyTicket('test1', ticket)
    const tickets = (state.lottery || {}).soldTickets || []
    const soldTickets = [newTicket, ...tickets]
    const newLottery = { ...state.lottery }
    ;(newLottery as Lottery).soldTickets = soldTickets
    commit('setLottery', newLottery)
  }
}

const getters: GetterTree<LottonState, RootState> = {}

const mod = {
  state,
  mutations,
  actions,
  getters,
  namespaced: true
}

export default mod
