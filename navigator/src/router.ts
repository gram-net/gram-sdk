/** @format */

import { handleError } from './common/lib/error-handling'
import { WalletState } from './common/store/Wallet/Wallet'
import { NotificationsState } from './common/store/Common/Notifications'
import { routes as lottonRoutes } from './apps/lotton/routes'
import Vue from 'vue'
import VueRouter from 'vue-router'
import Lotton from '@/apps/lotton/Lotton.vue'
import SomethingWrong from '@/common/components/SomethingWrong.vue'
import ForceRerender from '@/common/components/ForceRerender.vue'
import Backup from '@/common/modules/wallet/containers/Backup.vue'
import Create from '@/common/modules/wallet/containers/Create.vue'
import Import from '@/common/modules/wallet/containers/Import.vue'
import Send from '@/common/modules/wallet/containers/Send.vue'
import Wallets from '@/common/modules/wallet/containers/Wallets.vue'
import Wallet from '@/common/modules/wallet/containers/Wallet.vue'
import Receipt from '@/common/modules/wallet/containers/Receipt.vue'
import Created from '@/common/modules/wallet/containers/Created.vue'
import Networks from '@/common/modules/wallet/containers/Networks.vue'
import Settings from '@/common/modules/wallet/containers/Settings.vue'
import Receive from '@/common/modules/wallet/containers/Receive.vue'
import Transaction from '@/common/modules/wallet/containers/Transaction.vue'
import store, { RootState, notify } from '@/common/store'
import MountTapplet from '@/common/containers/MountTapplet.vue'
import Builder from '@/common/containers/Builder.vue'
import Console from '@/common/containers/Console.vue'
import CreatePin from '@/common/containers/CreatePin.vue'
import LoginPin from '@/common/containers/LoginPin.vue'
import Bip44 from '@/common/containers/Bip44.vue'
import localStorage from '@/common/containers/LocalStorage.vue'

Vue.use(VueRouter)

export const router = new VueRouter({
  scrollBehavior() {
    return { x: 0, y: 0 }
  },
  routes: [
    {
      path: '/',
      redirect: '/wallet'

      // todo: to /wallets or /wallet if authorized
    },
    {
      path: '/login-pin',
      component: LoginPin,
      name: 'Login',
      meta: {
        title: 'Enter PIN',
        showToolbar: true
      }
    },
    {
      path: '/create-pin',
      component: CreatePin,
      meta: {
        title: 'Create PIN',
        showToolbar: true
      }
    },

    {
      path: '/lotton',
      component: Lotton,
      children: lottonRoutes
    },
    {
      path: '/localstorage',
      name: 'LocalStorage',
      component: localStorage,
      meta: {
        title: 'LocalStorage',
        showToolbar: true
      }
    },
    {
      path: '/wallets',
      name: 'Wallets',
      component: Wallets,
      meta: {
        title: 'Portfolio',
        showToolbar: true
      }
    },
    {
      path: '/wallet/networks',
      name: 'Networks',
      component: Networks,
      meta: {
        title: 'Networks',
        showToolbar: true
      }
    },
    {
      path: '/wallet',
      name: 'Wallet',
      component: Wallet,
      meta: {
        title: 'Wallet',
        showToolbar: true,
        noShadow: true
      },
      beforeEnter(to, from, next) {
        const { wallet } = store.getters.Wallet
        if (wallet) {
          to.meta.title = wallet.name as string
          to.meta.toolbarType = wallet.color || 'primary'
        }
        next(wallet ? undefined : '/wallets')
      }
    },
    {
      path: '/wallet/transaction',
      name: 'Transaction',
      component: Transaction,
      meta: {
        title: 'Transaction',
        showToolbar: true,
        noShadow: true
      },
      beforeEnter(to, from, next) {
        const { transaction, wallet } = store.state.Wallet
        if (!wallet) return next('/wallets')
        if (!transaction) return next('/wallet')
        let id = ''

        if (transaction.hash) {
          const { hash } = transaction
          id = hash.substring(0, 4) + '...' + hash.substring(hash.length - 4, hash.length)
        }

        to.meta.toolbarType =
          transaction.type === 'received'
            ? 'success'
            : transaction.type === 'send'
            ? 'primary'
            : 'accent'
        to.meta.title = `Transaction ${id}`
        next()
      }
    },
    {
      path: '/wallet/import',
      name: 'Import Wallet',
      component: Import,
      meta: {
        title: 'Import Wallet',
        showToolbar: true,
        noShadow: true
      },
      beforeEnter(to, from, next) {
        const { key } = (store.state as RootState).Wallet
        if (!key) return next('/wallets')
        next()
      }
    },
    {
      path: '/wallet/Settings',
      name: 'Settings',
      component: Settings,
      meta: {
        title: 'Settings',
        showToolbar: true
      },
      beforeEnter(to, from, next) {
        const { wallet } = store.getters.Wallet
        if (!wallet) next('/wallets')
        else {
          to.meta.toolbarType = wallet.color || 'primary'
          next()
        }
      }
    },
    {
      path: '/wallet/receive',
      name: 'Receive',
      component: Receive,
      meta: {
        title: 'Receive',
        showToolbar: true,
        noShadow: true
      },
      beforeEnter(to, from, next) {
        const { wallet } = store.getters.Wallet
        if (wallet) {
          to.meta.title = 'Receive to ' + wallet.name
        }
        next()
      }
    },
    {
      path: '/wallet/send',
      name: 'Send',
      component: Send,
      meta: {
        title: 'Send',
        showToolbar: true,
        noShadow: true
      },
      beforeEnter(to, from, next) {
        const { wallet } = store.getters.Wallet
        if (wallet) {
          to.meta.title = 'Send from ' + wallet.name
        }
        next()
      }
    },
    {
      path: '/wallet/receipt',
      name: 'Confirm Transaction',
      component: Receipt,
      meta: {
        title: 'Confirm Transaction',
        showToolbar: true,
        hideFab: true
      },
      beforeEnter(from, to, next) {
        const transaction = store.state.Wallet.pendingTransaction
        transaction ? next() : next('/wallet/send')
      }
    },
    {
      path: '/wallet/created',
      name: 'Wallet Created',
      component: Created,
      meta: {
        title: 'Create Wallet',
        showToolbar: true,
        noShadow: true
      },
      beforeEnter(to, from, next) {
        const { key } = (store.state as RootState).Wallet
        if (!key) return next('/wallets')
        next()
      }
    },
    {
      path: '/wallet/create',
      name: 'Create Wallet',
      component: Create,
      meta: {
        showToolbar: true,
        title: 'Add Wallet'
      }
    },
    {
      path: '/wallet/backup',
      name: 'Backup Wallet',
      component: Backup,
      meta: {
        title: 'Backup Wallet',
        showToolbar: true,
        hideFab: true,
        hideBack: true
      },
      beforeEnter(to, from, next) {
        const { key } = (store.state as RootState).Wallet
        const { wallet } = store.getters.Wallet
        if (!key || !wallet) return next('/wallets')
        to.meta.title = `Back up ${wallet.name}`
        to.meta.toolbarType = wallet.color || 'primary'
        next()
      }
    },
    {
      path: '/force-rerender',
      name: 'Force Rerender',
      component: ForceRerender
    },
    {
      path: '/offline',
      component: SomethingWrong,
      name: 'Offline',
      meta: {
        transition: 'fade',
        props: {
          title: "You're not connected to the internet. Get online and try again."
        },
        title: 'Offline',
        showToolbar: true,
        hideBack: false,
        toolbarType: 'error'
      }
    },
    {
      path: '/not-found',
      component: SomethingWrong,
      name: 'Not Found',
      meta: {
        transition: 'fade',
        props: {
          error: 'Page not found.',
          title: '404'
        },
        title: 'Not found',
        showToolbar: true,
        hideBack: false
      }
    },
    {
      path: '/notification/:id',
      name: 'Notification',
      component: SomethingWrong,
      meta: {
        title: 'Notification',
        transition: 'fade',
        showToolbar: true
      },
      beforeEnter(to, from, next) {
        const notification = ((store.state as any).Common
          .Notifications as NotificationsState).notifications.find(
          (n) => n.id === to.params.id
        )
        if (notification) {
          const time = new Date(notification.timeCreated)
          to.meta.props = {
            title: notification.text,
            error: notification.payload,
            message: time.toLocaleDateString() + ' ' + time.toLocaleTimeString()
          }
          to.meta.toolbarType = notification.type
          next()
        }
      }
    },
    {
      path: '/tapplets',
      name: 'Tapplets',
      component: MountTapplet,
      meta: {
        title: 'Tapplets',
        hideBack: false,
        showToolbar: true
      }
    },
    {
      path: '/builder',
      name: 'Builder',
      component: Builder,
      meta: {
        title: 'Contract Builder',
        hideBack: false,
        showToolbar: true
      }
    },
    {
      path: '/bip44',
      name: 'Bip44',
      component: Bip44,
      meta: {
        title: 'TigerBee - Bip44',
        hideBack: false,
        showToolbar: true
      }
    },
    {
      path: '/console',
      name: 'Console Log',
      component: Console,
      meta: {
        title: 'TigerBee - Console',
        hideBack: false,
        showToolbar: true
      }
    },
    { path: '*', redirect: '/not-found' }
  ]
})

router.beforeEach(async (to, from, next) => {
  console.log(`%c[routeTo] ${to.fullPath}`, 'color: #00b4e8;')
  const { state, dispatch } = store

  if (to.name !== 'Login' && !state.Common.Login.auth) {
    next('/login-pin')
  }

  if (state.Wallet.forging || state.Wallet.sending || from.meta.cantGoBack) {
    notify({
      text: "Can't go back now",
      type: 'info',
      duration: 2500
    })
    return next(false)
  }

  if (
    navigator.onLine ||
    to.fullPath === '/offline' ||
    to.fullPath === '/force-rerender' ||
    to.name === 'Notification'
  ) {
    next()
  } else {
    next()
    handleError(
      null,
      "You're offline. Make sure you're connected to the internet and try again.",
      Infinity
      // true
    )
  }
})

export default router
