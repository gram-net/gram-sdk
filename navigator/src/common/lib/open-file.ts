/** @format */

import { getPlatform, Platform } from './get-platform'
import { downsampleBase64 } from './get-base64'
import { QRCode } from 'qrcode'
import png from 'png.js'
import jsQR from 'jsqr'
import { rejects } from 'assert'

export interface HTMLInputEvent extends Event {
  target: HTMLInputElement & EventTarget
}

export const openFile = (file: File): Promise<FileReader['result']> =>
  new Promise((res, rej) => {
    const reader = new FileReader()
    reader.readAsBinaryString(file)
    reader.onload = () => res(reader.result)
    reader.onerror = (error) => rej(error)
  })

export const openFileAsBuffer = (file: File): Promise<Buffer | Uint8Array> =>
  new Promise((res, rej) => {
    const reader = new FileReader()
    reader.readAsArrayBuffer(file)
    reader.onload = () => res(new Uint8Array(reader.result as any) as Buffer | Uint8Array)
    reader.onerror = (error) => rej(error)
  })

export const getImageData = (file: File): Promise<ImageData> =>
  new Promise((res) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const { height, width } = img
      if (ctx) {
        ctx.drawImage(img, 0, 0)
        const data = ctx.getImageData(0, 0, width, height)
        res(data)
      }
    }

    img.src = URL.createObjectURL(file)
  })

export const convertPNGtoByteArray = (pngData: any) => {
  const data = new Uint8ClampedArray(pngData.width * pngData.height * 4)
  for (let y = 0; y < pngData.height; y++) {
    for (let x = 0; x < pngData.width; x++) {
      const pixelData = pngData.getPixel(x, y)

      data[(y * pngData.width + x) * 4 + 0] = pixelData[0]
      data[(y * pngData.width + x) * 4 + 1] = pixelData[1]
      data[(y * pngData.width + x) * 4 + 2] = pixelData[2]
      data[(y * pngData.width + x) * 4 + 3] = pixelData[3]
    }
  }
  return data
}

export const readQr = async (file: File): Promise<QRCode | null> => {
  const pngData = await openFileAsBuffer(file)
  console.log({ pngData })
  return new Promise((res, rej) => {
    const pngReader = new png(pngData)
    pngReader.parse((err, pngData) => {
      if (err) rej(err)
      const pixelArray = convertPNGtoByteArray(pngData)
      const result = jsQR(pixelArray, pngData.width, pngData.height)
      res(result)
    })
  })
}

export const cordovaReadQr = (): Promise<string> =>
  new Promise((res, rej) => {
    if (getPlatform() !== Platform.Cordova) rej('Not platform cordova')
    ;(window as any).cordova.plugins.barcodeScanner.scan(
      (result) => res(result.text),
      (result) => res(result.text),
      // rej,
      {
        preferFrontCamera: false, // iOS and Android
        showFlipCameraButton: false, // iOS and Android
        showTorchButton: true, // iOS and Android
        torchOn: false, // Android, launch with the torch switched on (if available)
        saveHistory: false, // Android, save scan history (default false)
        prompt: 'Place a QR code inside the scan area', // Android
        resultDisplayDuration: 2000, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
        formats: 'QR_CODE', // default: all but PDF_417 and RSS_EXPANDED
        orientation: 'portrait', // Android only (portrait|landscape), default unset so it rotates with the device
        disableAnimations: true, // iOS
        disableSuccessBeep: true // iOS and Android
      }
    )
  })
