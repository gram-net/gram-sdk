/** @format */

export interface Network {
  id: string | number
  name: string
  RPCURL: string
  chainID: number
  symbol?: string
  blockExplorerURL?: string
  removable?: boolean
}
