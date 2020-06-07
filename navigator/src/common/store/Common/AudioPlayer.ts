/** @format */

import { Module, ActionTree, MutationTree, GetterTree } from 'vuex'
import { RootState } from '@/common/store'
import { Platform } from '@/common/lib/get-platform'

export interface AudioPlayerState {
  src: string
  /**
   * @remarks Key-value list of audio sources
   */
  fx: { [key: string]: string }
}

const state: AudioPlayerState = {
  src: '',
  fx: {
    click: './audio/selection/click.wav',
    woosh: './audio/selection/woosh.wav',
    loading: './audio/selection/loading.wav',
    success: './audio/selection/success.wav',
    error: './audio/selection/error.wav',
    warning: './audio/selection/warning.wav',
    info: './audio/selection/info.wav',
    hero: './audio/selection/hero.wav'
  }
}

const getters: GetterTree<AudioPlayerState, RootState> = {}

const mutations: MutationTree<AudioPlayerState> = {
  setSrc: (state, src: string) => (state.src = src)
}

const actions = {
  play: ({ state, commit, rootState }, src: string) => {
    if (
      (rootState as any).Common.Loading.online &&
      (rootState as any).TappletLauncher.platform !== Platform.Cordova
    ) {
      commit('setSrc', src)
      const audio = new Audio(state.src)
      audio.play()
    }
  }
}

// create dynamic actions for all sounds. i.e.: playClick, playPing
Object.entries(state.fx).forEach(([key, src]) => {
  const name = 'play' + (key.charAt(0).toUpperCase() + key.slice(1))
  actions[name] = ({ dispatch }) => dispatch('play', src)
})

const mod = {
  state,
  getters,
  mutations,
  actions,
  namespaced: false
}

export default mod
