/** @format */

import Tickets from './containers/Tickets.vue'
import Ticket from './containers/Ticket.vue'
import Winners from './containers/Winners.vue'

export const routes = [
  {
    path: '/',
    redirect: 'tickets'
  },
  {
    path: 'tickets',
    name: 'Tickets',
    component: Tickets,
    meta: {}
  },
  {
    path: 'winners/:id',
    name: 'Winner',
    component: Ticket,
    meta: {
      backButton: true,
      backRoute: '../winners'
    }
  },
  {
    path: 'tickets/:id',
    name: 'Ticket',
    component: Ticket,
    meta: {
      backButton: true,
      backRoute: '../tickets'
    }
  },
  {
    path: 'winners',
    name: 'Winners',
    component: Winners,
    meta: {
      backButton: true
    }
  }
]
