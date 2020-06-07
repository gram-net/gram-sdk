/** @format */

import { themeColors } from '@/vuetify'
import { makeid } from '@/common/lib/makeid'
import { Module, ActionTree, MutationTree, GetterTree } from 'vuex'
import { RootState } from '@/common/store'
import { Notification, NotificationType } from '@/common/models/notification'
import { NotificationOptions } from '@/common/models/notification'
import getPlatform, { Platform } from '@/common/lib/get-platform'

export const DISMISS = 'dismiss'
export const DISMISS_ALL = 'dismissAll'
export const NOTIFY = 'notify'
export const NOTIFICATION_COUNT = 'notificationCount'
export const NOTIFICATIONS_ACTIVE = 'notificationsActive'
export const NOTIFICATIONS_HISTORY = 'notificationsHistory'
export const REMOVE = 'remove'
export const REMOVE_ALL = 'removeAll'

export interface NotificationsState {
  notifications: Notification[]
}

export type NotifyResult = Promise<{
  notification: Notification
  dismissed: Promise<Notification>
}>

const state: NotificationsState = {
  notifications: JSON.parse(
    localStorage.getItem('notifications') || '[]'
  ) as Notification[]
}

function syncCache(state: NotificationsState) {
  localStorage.setItem('notifications', JSON.stringify(state.notifications))
}

const getters: GetterTree<NotificationsState, RootState> = {
  [NOTIFICATIONS_ACTIVE](state) {
    return state.notifications.filter((n) => !n.timeDismissed)
  },
  [NOTIFICATIONS_HISTORY](state) {
    return state.notifications.filter((n) => n.timeDismissed)
  },
  [NOTIFICATION_COUNT](state) {
    return state.notifications.filter((n) => !n.timeDismissed).length
  }
}

const mutations: MutationTree<NotificationsState> = {
  [DISMISS](state, id: string) {
    const notification = state.notifications.find((n) => n.id === id)
    if (notification) {
      notification.timeDismissed = new Date().toISOString()
      clearTimeout(notification.timer)
      syncCache(state)
    }
  },
  [REMOVE](state, id: string) {
    state.notifications = state.notifications.filter((n) => n.id !== id)
    syncCache(state)
  }
}

const actions = {
  [DISMISS_ALL]({ state, commit }) {
    state.notifications.forEach((n) => commit(DISMISS, n.id))
  },
  [REMOVE_ALL]({ state, commit }) {
    state.notifications.forEach((n) => commit(DISMISS, n.id))
    state.notifications.forEach((n) => commit(REMOVE, n.id))
  },
  async notify(
    { state, commit, dispatch, rootState },
    options: NotificationOptions
  ): NotifyResult {
    const id = makeid()
    const defaults = {
      duration: Infinity,
      timeCreated: new Date().toISOString(),
      type: 'info' as NotificationType,
      id,
      timeDismissed: '',
      timer: null,
      dismiss: () => commit(DISMISS, id)
    }
    const notification: Notification = {
      ...defaults,
      ...options
    }
    state.notifications = [...state.notifications, notification]
    syncCache(state)

    let sound: string, color: string

    switch (notification.type) {
      case 'success':
        sound = 'playSuccess'
        color = themeColors.success
        break
      case 'error':
        sound = 'playError'
        color = themeColors.error
        break
      case 'info':
        sound = 'playInfo'
        color = themeColors.info
        break
      case 'warning':
        sound = 'playWarning'
        color = themeColors.yellow
        break
      default:
        sound = 'playInfo'
        color = themeColors.info
    }

    console.log(
      `%c[notify] ${notification.text}`,
      `color: ${color}; font-weight: bold;`,
      notification.payload
    )

    dispatch(`Common/${sound}`, null, { root: true })

    return {
      notification,
      dismissed: new Promise((res) => {
        if (isFinite(notification.duration)) {
          setTimeout(() => {
            commit('dismiss', id)
            res(notification)
          }, notification.duration)
        } else {
          res(notification)
        }
      })
    }
  }
}

const mod = {
  state,
  getters,
  mutations,
  actions,
  namespaced: true
}

export default mod
