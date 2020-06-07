/** @format */

import { Ticket } from './ticket'

export interface Wallet {
  id: string
  balance: number
  name: string
  tickets?: Ticket[]
}
