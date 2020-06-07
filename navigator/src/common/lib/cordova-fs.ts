/** @format */

export const base = (name = '') => {
  const url = (window as any).cordova.file.applicationDirectory + 'www/tapplets/' + name
  // const url = "/storage/sdcard" + window.RootPath;
  return url
}

export const readdir = (path = '') =>
  new Promise((res, rej) => {
    ;(window as any).resolveLocalFileSystemURL(base() + path, (dir) => {
      const reader = dir.createReader()
      reader.readEntries(res, rej)
    })
  })

export const create = (file: File) =>
  new Promise((res, rej) => {
    ;(window as any).resolveLocalFileSystemURL(base(), (dir) => {
      dir.getFile(file.name, { create: true }, (obj) => {
        obj.createWriter((fileWriter) => {
          fileWriter.onwriteend = res
          fileWriter.seek(fileWriter.length)
          fileWriter.write(file)
        }, rej)
      })
    })
  })

export const unzip = (file: File, name: string) =>
  new Promise((res, rej) => {
    ;(window as any).zip.unzip(base() + file.name, base() + name, res)
  })

export const remove = (file: File) =>
  new Promise((res, rej) => {
    ;(window as any).resolveLocalFileSystemURL(base(), (dir) => {
      dir.getFile(file.name, { create: false }, (entry) => {
        entry.remove(res, rej, () => rej('File does not exists'))
      })
    })
  })

export const removedir = async (name: string) => {
  const dir = (await readdir(name)) as any
  dir.removeRecursively(Promise.resolve, Promise.reject)
}

export const fs = {
  readdir,
  create,
  remove,
  removedir
}

export default fs
