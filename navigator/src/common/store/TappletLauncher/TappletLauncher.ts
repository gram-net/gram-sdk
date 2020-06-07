/** @format */

import { Module, ActionTree, MutationTree, GetterTree } from 'vuex'
import { RootState } from '@/common/store'
import getPlatform, { Platform } from '@/common/lib/get-platform'
import {
  readdir,
  create,
  remove,
  removedir,
  unzip as cunzip
} from '@/common/lib/cordova-fs'
import { Httpd } from '@/common/models/httpd'

const platform = getPlatform()
let fs, unzip, Readable, getFs

if (platform === Platform.Electron) {
  fs = window.require('fs-extra-promise')
  unzip = window.require('unzip-stream')
  Readable = window.require('stream').Readable
}

if (platform === Platform.Cordova) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  fs = require('cordova-promise-fs')({
    persistent: true, // or false
    storageSize: 20 * 1024 * 1024, // storage size in bytes, default 20MB
    concurrency: 3 // how many concurrent uploads/downloads?
  })

  getFs = () =>
    new Promise((res) =>
      (window as any).requestFileSystem(
        (window as any).LocalFileSystem.PERSISTENT,
        0,
        (fs) => res(fs)
      )
    )
}

export interface TappletLauncherState {
  tapplets: string[]
  dir: string
  relativeDir: string
  mounted: Tapplet | null
  platform: Platform
  cordova: any
  fs: any
  fileServerUrl: string | null
}

export interface Tapplet {
  name: string
  path: string
}

const state: TappletLauncherState = {
  tapplets: [],
  mounted: null,
  dir: platform === Platform.Electron ? './public/tapplets/' : 'tapplets/',
  relativeDir: platform === Platform.Electron ? './tapplets/' : '/',
  platform,
  cordova: (window as any).cordova,
  fs: null,
  fileServerUrl: null
}

const getters: GetterTree<TappletLauncherState, RootState> = {
  httpd: (state) => state.cordova.plugins.CorHttpd as Httpd
}

const mutations: MutationTree<TappletLauncherState> = {
  setTapplets: (state, tapplets: string[]) => (state.tapplets = tapplets),
  mount: (state, name: string) => {
    state.mounted = {
      name,
      path:
        (state.platform === Platform.Electron
          ? state.relativeDir
          : (state.fileServerUrl as string) + '/') + name
    }
  },
  setFs: (state, fs) => (state.fs = fs),
  setCordova: (state, cordova) => (state.cordova = cordova),
  setRelativeDir: (state, dir) => (state.relativeDir = dir),
  setFileServerUrl: (state, url) => (state.fileServerUrl = url),
  unmount: (state) => (state.mounted = null)
}

const actions = {
  async setFs({ state, commit, dispatch }) {
    commit('setFs', await getFs())
    commit('setCordova', (window as any).cordova)
    await dispatch('syncDir')
  },

  async syncDir({ state, commit }) {
    if (state.platform === Platform.Electron) {
      const tapplets = await fs.readdirAsync(state.dir)
      commit('setTapplets', tapplets)
    } else if (state.platform === Platform.Cordova) {
      const dir: any[] = (await readdir()) as any
      const tapplets = dir.filter((file) => !file.isFile).map((file) => file.name)
      commit('setTapplets', tapplets)
    }
  },

  async save({ commit, state, dispatch }, file: File) {
    await dispatch('syncDir')
    const isZip = file.name.indexOf('.zip') === file.name.length - 4

    if (!isZip) return
    const name = file.name.substr(0, file.name.length - 4)

    if (state.platform === Platform.Electron) {
      const exists = await fs.existsAsync(state.dir + name)
      if (exists) return
      const buffer = new Buffer(await (file as any).arrayBuffer())
      const readable = new Readable()
      readable._read = () => null
      readable.push(buffer)
      readable.pipe(unzip.Extract({ path: state.dir }))

      for await (const chunk of readable) {
        await dispatch('syncDir')
      }
    }
    if (state.platform === Platform.Cordova) {
      const data = await create(file)
      const zip = await cunzip(file, name)
      const removed = await remove(file)
      await dispatch('syncDir')
    }
  },

  async remove({ commit, state, dispatch }, name: string) {
    if (state.platform === Platform.Electron) {
      await dispatch('syncDir')
      const dir = state.dir + name
      const exists = await fs.existsAsync(dir)
      if (exists) {
        await fs.removeAsync(dir)
        if (state.mounted && state.mounted.name === name) commit('unmount')
        await dispatch('syncDir')
      }
    }
    if (state.platform === Platform.Cordova) {
      const remove = await removedir(name)
      console.log('[remove]', remove)
      await dispatch('syncDir')
    }
  },

  async stopServer({ getters, commit }) {
    return new Promise((res, rej) => {
      ;(getters.httpd as Httpd).stopServer((suc) => {
        commit('setFileServerUrl', suc)
        res(suc)
      }, rej)
    })
  },

  startServer(
    { getters, commit },
    options: any = { www_root: '/', port: 8061, localhost_only: false }
  ) {
    const settings = Object.assign(
      {
        www_root: options.www_root,
        port: options.port,
        localhost_only: false
      },
      options || {}
    )

    return new Promise((res, rej) => {
      ;(getters.httpd as Httpd).startServer(
        settings,
        (suc) => {
          commit('setFileServerUrl', suc)
          res(suc)
        },
        rej
      )
    })
  },

  getLocalPath({ getters, commit }) {
    return new Promise((res, rej) => {
      ;(getters.httpd as Httpd).getLocalPath((suc) => {
        commit('setFileServerUrl', suc)
        res(suc)
      }, rej)
    })
  },

  getURL({ getters, commit }) {
    return new Promise((res, rej) => {
      ;(getters.httpd as Httpd).getURL((suc) => {
        commit('setFileServerUrl', suc)
        res(suc)
      }, rej)
    })
  }
}

const mod = {
  state,
  getters,
  mutations,
  actions,
  namespaced: true
}

export default mod
