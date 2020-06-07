/** @format */

export interface Block {
  /**
   * @field workchainId typically `-1 | 0 | 1`
   */
  workchain: -1 | 0 | 1
  shard: string
  seqno: number
  roothash: string
  filehash: string
}

export interface TransactionSummary {
  /**
   * @field account address in `baddr` format
   */
  account: string
  lt: number
  hash: string
}

export interface Message {
  hash: string
  type: 'internal' | 'external' | null
  source: string | null
  destination: string
  message: string
  lt?: string
  time?: number
  value?: string
}

export interface TransactionResponse {
  block: Block
  workchain: '-1' | '0' | '1'
  account_hex: string
  /**
   * @field account address in `baddr` format
   */
  account: string
  hash: string
  lt: string
  time: number
  out_messages: Message[]
  in_message: Message | null
  prev_transaction: TransactionSummary | null
  transaction: string
}

export interface Transaction {
  type: 'send' | 'received' | 'incoming' | 'outgoing'
  workchain: '-1' | '0' | '1'
  block: Block
  account_hex: string
  account: string
  hash?: string
  lt?: string
  time: number
  prev_transaction: TransactionSummary | null
  transaction: string
  source: string | null
  destination: string | null
  value?: number | null
}

export const mapTransactions = (response: TransactionResponse[]) => {
  return response
    .map((t) => {
      const inMsg = t.in_message
      const outMsgs = t.out_messages
      const transaction: any = { ...t }
      delete transaction.in_message
      delete transaction.out_messages

      const messages = outMsgs.map((m) => ({
        ...transaction,
        ...m,
        type: 'incoming'
      }))
      if (inMsg) {
        messages.push({
          ...transaction,
          ...inMsg,
          type: 'outgoing'
        })
      }

      const myAddr = (hex: string, xaddr: string) => {
        const addrBuf = Buffer.from(hex, 'hex')
        const xAddrBuf = Buffer.from(xaddr, 'base64').slice(2, 34)
        return Buffer.compare(addrBuf, xAddrBuf) === 0
      }

      const mapped = messages.map((m: Transaction) => {
        if (m.value) {
          m.value = +m.value
          if (myAddr(m.account_hex, <string>m.destination)) m.type = 'received'
          if (myAddr(m.account_hex, <string>m.source)) m.type = 'send'
        }
        return m
      })

      return mapped
    })
    .flat()
    .slice()
    .sort((a, b) => b.time - a.time)
}
