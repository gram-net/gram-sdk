/** @format */

import { symbol } from './../../lib/constants'
import { vuetify } from '@/main'
import { getCache, setCache } from '@/common/lib/cache'
import { defineGetters, defineMutations, defineActions, defineModule } from 'direct-vuex'
import { moduleActionContext } from '..'

export interface HelpStep {
  name: string
  overlay: boolean
  content: string
}

const steps: HelpStep[] = [
  {
    name: '1',
    overlay: true,
    content: `Welcome to TigerBee 🐯🐝`
  },
  {
    name: '2',
    overlay: true,
    content: `Start by creating your first key 🔑`
  },
  {
    name: '23',
    overlay: true,
    content: `This key will be used to back up wallets 🔐`
  },
  {
    name: '5',
    overlay: true,
    content: `You'll get 20 free ${symbol}'s with every created wallet!`
  },
  {
    name: '4',
    overlay: true,
    content: `If you need any help press the button up there ↗️`
  }
]

export interface HelpState {
  firstTime: boolean
  open: boolean
  activeIndex: number
  steps: HelpStep[]
}

const activateStep = (name: string) => {
  const active = document.querySelector(`[data-help="${name}"]`) as
    | HTMLElement
    | undefined
  if (active) {
    setTimeout(() => {
      active.scrollIntoView({
        behavior: 'smooth'
      })
    }, 500)
  } else {
    console.warn(`Help element not found [${name}]`)
  }
}

const state: HelpState = {
  firstTime: getCache<boolean>('firstTime', false),
  open: getCache<boolean>('helpOpen', true),
  activeIndex: 0,
  steps
}

const getters = defineGetters<HelpState>()({
  activeHelpStep(state) {
    return state.steps[state.activeIndex]
  },
  lastHelpStep(state) {
    return state.activeIndex === state.steps.length - 1
  },
  secondLastHelpStep(state) {
    return state.activeIndex === state.steps.length - 2
  },
  showHelpOverlay(state) {
    return state.open
    // return state.open && state.steps[state.activeIndex].overlay;
  }
})

const mutations = defineMutations<HelpState>()({
  setHelpOpen(state, value: boolean) {
    state.open = value
    setCache('helpOpen', state.open)
  },
  toggle(state) {
    state.open = !state.open
    setCache('helpOpen', state.open)
  },
  setHelpStepByName(state, name: string) {
    const i = state.steps.findIndex((step) => step.name === name)
    if (i > -1) state.activeIndex = i
  },
  clearHelp(state) {
    state.activeIndex = 0
    state.open = false
    setCache('helpOpen', state.open)
  },
  setActiveIndex(state, index: number) {
    state.activeIndex = index
  }
})

const actions = defineActions({
  toggle(ctx) {
    const { commit, state, getters } = moduleCtx(ctx)
    commit.toggle()
    if (state.open) {
      activateStep(getters.activeHelpStep.name)
    }
  },
  nextHelpStep(ctx) {
    const { commit, state, getters } = moduleCtx(ctx)
    if (state.activeIndex < state.steps.length - 1) {
      const i = state.activeIndex + 1
      commit.setActiveIndex(i)
      const { name } = getters.activeHelpStep
      activateStep(name)
    }
  }
})

const helpModule = defineModule({
  state,
  getters,
  mutations,
  actions,
  namespaced: true
})

const moduleCtx = (context: any) => moduleActionContext(context, helpModule)

export default helpModule
