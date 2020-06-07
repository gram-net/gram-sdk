/** @format */

export type Account = {
  id?: string
  account?: string
  last_transaction?: {
    id?: string
    account?: string
    lt?: string
    hash?: string
  }
}

export type Transaction = {
  id?: string
  account?: string
  lt?: string
  hash?: string
}
