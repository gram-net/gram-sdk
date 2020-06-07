/** @format */

export enum Platform {
  Cordova = 'cordova',
  Electron = 'electron',
  Browser = 'browser',
  CordovaBrowser = 'cordova browser'
}

/**
 * Get platform type
 * @return `enum Platform: "cordova" | "electron" | "browser" | "unsupported`
 */
export const getPlatform = (): Platform => {
  let platform: Platform = Platform.Browser

  const mobile = navigator.userAgent.match(
    /(iPhone|iPod|iPad|Android|BlackBerry|IEMobile)/
  )

  if (window.navigator.userAgent.indexOf('Electron/') > -1) {
    platform = Platform.Electron
  } else if ('cordova' in window && mobile) {
    platform = Platform.Cordova
  } else if ('cordova' in window) {
    platform = Platform.CordovaBrowser
  }
  return platform
}

export default getPlatform
