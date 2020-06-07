/** @format */

import { Ticket } from './ticket'

export enum LotteryState {
  Idle = -99,
  Scheduled = 0,
  InProgress = 1,
  Finished = 99
}

export interface Lottery {
  id: string
  state: LotteryState
  timeStarted?: string | null
  timeEnded?: string | null
  winner?: Ticket | null
  soldTickets?: Ticket[] | null
}
