/** @format */

import { Lottery, LotteryState } from './../models/lottery'
import { tickets } from './tickets.mock'

export const lotteryMock: Lottery = {
  id: 'test1',
  state: LotteryState.Scheduled,
  winner: null,
  soldTickets: tickets.filter((t) => (t.lotteryId = 'test1')),
  timeStarted: new Date('09/31/2019').toISOString(),
  timeEnded: null
}
