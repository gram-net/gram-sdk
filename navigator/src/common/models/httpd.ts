/** @format */

type SuccessCb = (url: string) => void
type ErrorCb = (error: any) => void
type Settings = { [name: string]: any }

export interface Httpd {
  getURL(success?: SuccessCb, error?: ErrorCb): void
  getLocalPath(success?: SuccessCb, error?: ErrorCb)
  startServer(settings: Settings, success?: SuccessCb, error?: ErrorCb): void
  stopServer(success?: SuccessCb, error?: ErrorCb): void
}
