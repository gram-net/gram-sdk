/** @format */

import { Wallet } from './../models/wallet'
import { makeid } from '@/common/lib/makeid'

export const accountMock: Wallet[] = [
  {
    id: makeid(10),
    balance: 2500,
    name: 'My first wallet'
  },
  {
    id: makeid(10),
    balance: 10030,
    name: 'My second wallet'
  },
  {
    id: makeid(10),
    balance: 500,
    name: 'My third wallet'
  }
]
