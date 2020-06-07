/** @format */

import { lotteryMock } from './../data/lottery.mock'
import { accountMock } from './../data/account.mock'
import { Ticket } from '../models/ticket'
import { tickets } from '../data/tickets.mock'

export const getAccount = () => Promise.resolve(accountMock)

export const getLottery = (id: string) =>
  Promise.resolve(lotteryMock.id === id ? lotteryMock : null)

export const getWinners = () =>
  Promise.resolve(tickets.filter((_, i) => i > tickets.length - 10))

export const getTicket = (id: string) => Promise.resolve(tickets.find((t) => t.id === id))

export const buyTicket = (lotteryId: string, ticket: Ticket) => Promise.resolve(ticket)
