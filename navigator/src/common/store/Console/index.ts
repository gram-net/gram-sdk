/** @format */

import { Module, ActionTree, MutationTree } from 'vuex'
import { RootState } from '@/common/store'
import { LogEntry, LogType } from '@/common/models/logentry'
import { pipeConsole, testConsole } from '@/pipe-console'

export interface ConsoleState {
  logs: LogEntry[]
  logging: boolean
  originalConsole: any
}

const state: ConsoleState = {
  logs: <LogEntry[]>JSON.parse(localStorage.getItem('logs') || '[]'),
  logging: JSON.parse(localStorage.getItem('logging') || 'false'),
  originalConsole: {}
}

const mutations = {
  clearLogs: (state) => {
    state.logs = []
    localStorage.removeItem('logs')
    console.clear()
    console.log('%cConsole was cleared', 'color: grey; font-style: italic;')
  },
  appendLog: (state, log) => {
    state.logs = [log, ...state.logs]
    localStorage.setItem('logs', JSON.stringify(state.logs))
  },
  updateLastLogCounter: (state, index) => {
    state.logs[index].incrementCounter()
    localStorage.setItem('logs', JSON.stringify(state.logs))
  },
  overrideOriginalConsole: (state, log) => {
    if (!state.originalConsole.hasOwnProperty(log.type))
      state.originalConsole[log.type] = console[log.type]
  },
  enableLogging(state, store) {
    pipeConsole(['log', 'dir', 'info', 'warn', 'error'], this)
    state.logging = true
    localStorage.setItem('logging', state.logging + '')
    console.warn('Logging ENABLED!')
  },
  disableLogging: (state) => {
    for (const type in state.originalConsole) console[type] = state.originalConsole[type]
    state.originalConsole = {}
    state.logging = false
    localStorage.setItem('logging', state.logging + '')
    console.warn('Logging DISABLED!')
  }
}

const actions = {
  toggleLogging: ({ commit }) => {
    state.logging ? commit('disableLogging') : commit('enableLogging')
  },
  appendLog: ({ commit, state }, opts) => {
    const args = opts.log as any[]
    const type = opts.type as LogType

    const lastLogIndex = state.logs.length - 1
    if (
      state.logs.length > 0 &&
      state.logs[lastLogIndex].args == args &&
      state.logs[lastLogIndex].type == type &&
      state.logs[lastLogIndex] instanceof LogEntry
    ) {
      commit('updateLastLogCounter', lastLogIndex)
    } else {
      commit('appendLog', new LogEntry(args, type))
    }
  }
}

const mod = {
  state,
  mutations,
  actions,
  namespaced: true
}

export default mod
