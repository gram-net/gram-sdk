/** @format */

export function getBase64(file: File) {
  return new Promise((resolve, reject) => {
    if (file && file.size) {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = (error) => reject(error)
    } else {
      return resolve('')
    }
  })
}

export function getUint8Array(file: File) {
  return new Promise((resolve, reject) => {
    if (file && file.size) {
      const reader = new FileReader()
      reader.readAsArrayBuffer(file)
      reader.onload = () => {
        const { result } = reader
        return resolve(new Uint8Array(result as ArrayBuffer))
      }
      reader.onerror = (error) => reject(error)
    } else {
      return resolve('')
    }
  })
}

export const bufferToBase64 = (buffer: Uint8Array) => {
  return btoa(buffer.reduce((data, byte) => data + String.fromCharCode(byte), ''))
}

export const base64ToBuffer = (str: string) =>
  Uint8Array.from(atob(str), (c) => c.charCodeAt(0))

export async function base64ToFile(url: string, name = 'File') {
  let str = url
  if (url.indexOf(';base64,') < 0) {
    str = ';base64,' + str
  }
  const res = await fetch(str)

  const blob = await res.blob()
  console.log({ res, blob })

  return new File([blob], name)
}

export const downsampleBase64 = (img: string, width = 70, height = 70) => {
  return new Promise((res) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    canvas.width = width
    canvas.height = height

    const image = new Image()
    image.src = img

    image.addEventListener('load', (e) => {
      if (!ctx) return res('')
      ctx.drawImage(
        image,
        0,
        0,
        image.width,
        image.height,
        0,
        0,
        canvas.width,
        canvas.height
      )
      const img = canvas.toDataURL()
      res(img)
    })
  })
}
