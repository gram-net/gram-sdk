/** @format */

import { defineModule, defineMutations } from 'direct-vuex'
import { defineActions } from 'direct-vuex'
import { notify } from '..'
import { Module, ActionTree, MutationTree, GetterTree } from 'vuex'
import { RootState } from '@/common/store'
import getPlatform, { Platform } from '@/common/lib/get-platform'
import QRCode from 'qrcode'

const getCopyEl = () => {
  // hacky way to support browser cordova
  const id = 'copy-clipboard-element'
  const exists = document.getElementById(id)
  if (exists) return exists as HTMLInputElement
  const copyEl = document.createElement('input')
  copyEl.id = id
  copyEl.setAttribute(
    'style',
    'height: 0; margin: -30px; border: 0; display: block; pointer-events: none; overflow: hidden; position: fixed; top: -99999999px; width: 40px;'
  )
  document.body.appendChild(copyEl)
  return copyEl
}
getCopyEl()

export interface UtilsState {}

const state: UtilsState = {}

const getters: GetterTree<UtilsState, RootState> = {}

const mutations = defineMutations()({})

const actions = defineActions({
  /**
   *
   * @param str The string to copy
   * @remarks
   *  * Notifies the user of the copied string
   *  * If block to support Electron
   * @returns `str: String`
   */
  copy(_, value: string) {
    const platform = getPlatform()
    let text = `${value.slice(0, 15)}...\n Copied to clipboard `
    let success = true

    if (platform === Platform.Electron) {
      require('electron').clipboard.writeText(value)
    } else if (platform === Platform.Cordova) {
      ;(window as any).cordova.plugins.clipboard.copy(value)
    } else {
      const input = getCopyEl()
      input.setAttribute('value', value)
      input.select()
      input.blur()
      success = document.execCommand('copy')
      input.blur()
      if (!success) text = 'Something went wrong'
    }

    notify({
      text,
      duration: 2000,
      type: success ? 'info' : 'error'
    })
    return value
  },
  /**
   * Get the QR code from any wallet
   * @param value `string`
   * @returns `Promise<string>` base64 string of the QR Code PNG
   */
  async getQR(_, value: string): Promise<string> {
    try {
      return await QRCode.toDataURL(value)
    } catch (error) {
      console.warn(error)
      return ''
    }
  },
  downloadURL(_, payload: { url: string; name: string }) {
    const a = document.createElement('a')
    document.body.appendChild(a)
    a.setAttribute('style', 'display: none')
    a.setAttribute('href', payload.url)
    a.setAttribute('download', payload.name)
    a.click()
  },
  downloadString(_, payload: { value: string; encoding: string; name: string }) {
    console.log(payload.value)
    const buffer = Buffer.from(payload.value, (payload.encoding as any) || 'hex')
    const blob = new Blob([buffer], { type: 'octet/stream' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    document.body.appendChild(a)
    a.setAttribute('style', 'display: none')
    a.setAttribute('href', url)
    a.setAttribute('download', payload.name)
    a.click()
    URL.revokeObjectURL(url)
  }
})

const mod = defineModule({
  state,
  getters,
  mutations,
  actions,
  namespaced: false
})

export default mod
