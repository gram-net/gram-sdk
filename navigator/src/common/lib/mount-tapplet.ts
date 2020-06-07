/** @format */

import { openFile } from '@/common/lib/open-file'

export const mountTapplet = async (file: File) => {
  try {
    const js = (await openFile(file)) as string
    const tagName = file.name.replace(/\.[^/.]+$/, '')
    const id = 'gram-net-tapplet-' + tagName
    const exists = document.getElementById(id)

    if (exists) {
      exists.outerHTML = ''
    }

    const script = document.createElement('script')
    script.id = id
    script.innerHTML = js
    document.body.appendChild(script)

    const tapplet = document.createElement(tagName)
    const el = document.createElement('div')
    el.appendChild(tapplet)

    return Promise.resolve({
      tagName,
      el
    })
  } catch (e) {
    return Promise.reject({
      message: "Can't mount. Invalid Tapplet",
      error: e
    })
  }
}
