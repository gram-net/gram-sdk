<!-- @format -->

<template>
  <div class="nav-bar" :class="{ 'no--shadow': $route.meta.noShadow }">
    <v-speed-dial
      v-model="fab"
      :bottom="true"
      :right="true"
      :top="false"
      :left="false"
      direction="top"
      class="app__speeddial"
    >
      <template v-slot:activator>
        <v-btn
          v-model="fab"
          :hidden="$route.meta.hideFab || size['x-small']"
          name="nav-drawer"
          :small="size['x-small']"
          color="primary"
          dark
          fab
          @click="openDrawerFromFab"
        >
          <v-badge
            color="red"
            overlap
            :value="notificationCount"
            :offset-x="-1.5"
            :offset-y="-1.5"
          >
            <template v-if="notificationCount > 0" v-slot:badge>
              <span v-if="notificationCount > 0">{{ notificationCount }}</span>
            </template>
            <v-icon v-if="notificationCount > 0">
              notifications_active
            </v-icon>
            <v-icon v-else>
              menu
            </v-icon>
          </v-badge>
        </v-btn>
      </template>
    </v-speed-dial>

    <v-app-bar
      v-if="showToolbar"
      app
      :color="$route.meta.toolbarType || 'primary'"
      dark
      class="main-app-bar"
    >
      <v-btn
        v-if="!route.hideBack"
        large
        icon
        name="back-button"
        :loading="loading"
        @click="back"
      >
        <v-icon>keyboard_arrow_left</v-icon>
      </v-btn>
      <v-btn
        :hidden="$route.meta.hideFab || !size['x-small']"
        class="unclickable d-transparent mr-n3"
        icon
      >
        <v-icon>keyboard_arrow_left</v-icon>
      </v-btn>
      <v-spacer />
      <v-toolbar-title class="title">
        <span>{{ route.title || '' }}</span>
      </v-toolbar-title>
      <v-spacer />
      <v-btn icon :input-value="helpOpen" class="mr-n2" @click="toggleHelp">
        <v-icon>help_outline</v-icon>
      </v-btn>
      <v-btn
        :hidden="$route.meta.hideFab || !size['x-small']"
        name="nav-drawer"
        icon
        @click="openDrawerFromFab"
      >
        <v-badge color="red" overlap :value="notificationCount">
          <template v-if="notificationCount > 0" v-slot:badge>
            <span v-if="notificationCount > 0">{{ notificationCount }}</span>
          </template>
          <v-icon v-if="notificationCount > 0">
            notifications_active
          </v-icon>
          <v-icon v-else>
            menu
          </v-icon>
        </v-badge>
      </v-btn>
    </v-app-bar>

    <v-navigation-drawer
      v-model="drawerOpenModel"
      fixed
      temporary
      right
      :width="300"
      class="main-nav-drawer"
    >
      <v-tabs v-model="tabModel" :grow="true">
        <v-tabs-slider />

        <v-tab href="#tab-list" @click="click">
          Menu
        </v-tab>

        <v-tab href="#tab-notifications" @click="click">
          Notifications
          <v-badge v-if="notificationCount > 0" color="red" class="ml-2">
            <template v-slot:badge>
              {{ notificationCount }}
            </template>
          </v-badge>
        </v-tab>

        <v-tab-item value="tab-list">
          <v-divider />

          <v-subheader class="wallet-selector mb-n4">
            <span class="clickable" @click="navigate('wallets', {}, '')">Portfolio</span>
            <v-menu bottom left max-width="270">
              <template v-slot:activator="{ on }">
                <v-btn icon class="wallet-selector__menu-btn" v-on="on">
                  <v-icon>mdi-dots-vertical</v-icon>
                </v-btn>
              </template>

              <v-list>
                <template v-for="(w, i) of otherWallets">
                  <WalletSummary :key="i" :wallet="w" @open="openWallet(w)" />
                </template>
                <v-list-item @click.stop="refreshWallets">
                  <v-list-item-title>Refresh Wallets</v-list-item-title>
                </v-list-item>
                <v-list-item @click="navigate('wallets', {}, '')">
                  <v-list-item-title>Wallets</v-list-item-title>
                </v-list-item>
                <v-list-item @click="navigate('wallet/networks', {}, '')">
                  <v-list-item-title>Networks</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </v-subheader>

          <div>
            <div v-if="walletsInMenu.length < 1">
              <WalletSummary :wallet="null" @open="openWallet(null)" />
            </div>

            <div v-for="(wallet, i) of walletsInMenu" v-else :key="'sum-' + i">
              <WalletSummary :wallet="wallet" @open="openWallet(wallet)" />
              <v-divider v-if="walletsInMenu > 0" />
            </div>
            <v-btn
              class="type--square"
              block
              small
              style="box-shadow: none;"
              @click="navigate('wallets', {}, '')"
            >
              Show All
            </v-btn>
          </div>

          <template v-if="mode === 'expert'">
            <v-subheader>Developers</v-subheader>

            <v-list-item link @click="navigate('tapplets')">
              <v-list-item-icon>
                <v-icon>extension</v-icon>
              </v-list-item-icon>

              <v-list-item-content>
                <v-list-item-title>Tapplets</v-list-item-title>
              </v-list-item-content>
            </v-list-item>

            <v-list-item link @click="navigate('bip44')">
              <v-list-item-icon>
                <v-icon>enhanced_encryption</v-icon>
              </v-list-item-icon>

              <v-list-item-content>
                <v-list-item-title>Bip44</v-list-item-title>
              </v-list-item-content>
            </v-list-item>

            <v-list-item link @click="navigate('builder')">
              <v-list-item-icon>
                <v-icon>build</v-icon>
              </v-list-item-icon>

              <v-list-item-content>
                <v-list-item-title>Contract Builder</v-list-item-title>
              </v-list-item-content>
            </v-list-item>

            <v-list-item link @click="navigate('/', {}, 'lotton')">
              <v-list-item-icon>
                <v-icon>style</v-icon>
              </v-list-item-icon>

              <v-list-item-content>
                <v-list-item-title>Lotton</v-list-item-title>
              </v-list-item-content>
            </v-list-item>

            <v-list-item link @click="navigate('console')">
              <v-list-item-icon>
                <v-icon>dvr</v-icon>
              </v-list-item-icon>

              <v-list-item-content>
                <v-list-item-title>Console</v-list-item-title>
              </v-list-item-content>
            </v-list-item>

            <v-list-item link @click="navigate('localstorage')">
              <v-list-item-icon>
                <v-icon>storage</v-icon>
              </v-list-item-icon>

              <v-list-item-content>
                <v-list-item-title>Storage</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </template>

          <v-subheader>Settings</v-subheader>

          <v-list-item link @click="toggleExpertMode()">
            <v-list-item-icon>
              <v-icon v-if="settings.mode === 'expert'">
                toggle_on
              </v-icon>
              <v-icon v-else>
                toggle_off
              </v-icon>
            </v-list-item-icon>

            <v-list-item-content>
              <v-list-item-title>Expert mode</v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-list-item link @click="toggleDarkMode()">
            <v-list-item-icon>
              <v-icon v-if="settings.theme === 'dark'">
                toggle_on
              </v-icon>
              <v-icon v-else>
                toggle_off
              </v-icon>
            </v-list-item-icon>

            <v-list-item-content>
              <v-list-item-title>Dark mode</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-tab-item>

        <v-tab-item value="tab-notifications">
          <v-divider />

          <v-container>
            <div v-if="notifications.length > 0" class="mb-4 text-right">
              <v-btn small @click="removeAll">
                Clear
              </v-btn>
            </div>

            <p v-else class="half-transparent text-center pa-3 pt-6">
              No new notifications
            </p>

            <div
              v-for="notification of [...notificationsActive].reverse().slice(0, 30)"
              :key="'active-' + notification.id"
              class="clickable"
              @click="dismiss(notification.id)"
            >
              <Notification :notification="notification" />
            </div>

            <v-divider
              v-if="notificationsActive.length > 0 && notificationsHistory.length > 0"
              class="mt-7 mb-5"
            />

            <p
              v-if="notificationsHistory.length > 0"
              class="mb-3 mt-0 slightly-transparent"
            >
              History
            </p>

            <div
              v-for="notification of [...notificationsHistory].reverse().slice(0, 30)"
              :key="'history-' + notification.id"
            >
              <Notification :notification="notification" />
            </div>
          </v-container>
        </v-tab-item>
      </v-tabs>
    </v-navigation-drawer>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Emit } from 'vue-property-decorator'
import { mapState, mapGetters, mapActions } from 'vuex'
import Notification from '@/common/components/Notification.vue'
import {
  Notification as NotificationModel,
  NotificationOptions
} from '@/common/models/notification'
import {
  NOTIFICATION_COUNT,
  NOTIFICATIONS_ACTIVE,
  NOTIFICATIONS_HISTORY
} from '@/common/store/Common/Notifications'
import WalletSummary from '@/common/components/WalletSummary.vue'
import { AudioPlayerState } from '../store/Common/AudioPlayer'
import { gram } from '@/common/lib/format'
import store, { RootState, notify } from '../store'
import { handleTimeout, handleError } from '../lib/error-handling'
import { setCache, getCache } from '@/common/lib/cache'
import { SettingsState, Mode } from '../store/Common/Settings'
import { Wallet } from '../store/Wallet/Wallet'

@Component({
  components: {
    Notification,
    WalletSummary
  },
  filters: {
    gram
  },
  computed: {
    ...mapState<RootState>({
      loading: (state) => state.Common.Loading.loading,
      drawerOpen: (state) => state.Common.NavBar.drawerOpen,
      tab: (state) => state.Common.NavBar.tab,
      notifications: (state) => state.Common.Notifications.notifications,
      settings: (state) => state.Common.Settings,
      wallet: (state) => state.Wallet.wallet,
      wallets: (state) =>
        state.Wallet.wallets.sort((a, b) => {
          return b.lastUsed < a.lastUsed ? -1 : b.lastUsed > a.lastUsed ? 1 : 0
        }),
      fx: (state) => state.Common.AudioPlayer.fx,
      mode: (state) => state.Common.Settings.mode
    }),
    ...mapGetters('Common/Notifications', [
      NOTIFICATION_COUNT,
      NOTIFICATIONS_ACTIVE,
      NOTIFICATIONS_HISTORY
    ])
  }
})
export default class NavBar extends Vue {
  tab!: string
  notificationCount!: number
  loading!: boolean
  drawerOpen!: boolean
  notifications!: NotificationModel[]
  startLoading: any
  fab = false
  wallet!: Wallet
  wallets!: Wallet[]
  fx!: AudioPlayerState['fx']
  maxWallets = 2
  settings!: SettingsState
  mode!: Mode

  get walletsInMenu() {
    return [...(this.wallets || [])].splice(0, this.maxWallets)
  }

  get otherWallets() {
    return [...(this.wallets || [])].splice(this.maxWallets)
  }

  // mounted() {}

  click() {
    this.$store.dispatch('Common/playClick')
  }

  get showToolbar() {
    return this.$route.matched.some((match) => !!match.meta.showToolbar)
  }

  toggleHelp() {
    store.dispatch.Common.Help.toggle()
  }

  async clearLocalStorage() {
    const { dispatch } = store
    const yes = await this.$confirm(
      'Do you really want to clear all app data including wallets and keys?'
    )
    if (yes) {
      localStorage.clear()
      location.reload()
    }
  }

  get helpOpen() {
    return store.state.Common.Help.open
  }

  openWallet(wallet: Wallet) {
    const { commit, dispatch } = store
    this.click()
    this.drawerOpenModel = false

    if (!this.$route.meta.cantGoBack) {
      dispatch.Common.startLoading({
        value: 'Loading…',
        command: 'startLoadingOverlay'
      })
    }

    this.$router
      .push('/force-rerender')
      .then(() => {
        setTimeout(() => {
          commit.Wallet.setWallet(wallet)
          this.$router.push('/wallet')
        }, 100)
      })
      .catch((_) => {
        let noop = true
      })
  }

  async navigate(r: string, query = {}, app = '') {
    const { commit, dispatch } = store
    this.click()
    const route = '/' + app + r
    this.drawerOpenModel = false
    try {
      if (!this.$route.meta.cantGoBack) {
        dispatch.Common.startLoading({
          value: 'Loading…',
          command: 'startLoadingOverlay'
        })
      }

      await this.$router.push({
        path: route,
        query
      })
    } catch {
      commit.Common.stopLoading()
    }
  }

  openDrawerFromFab() {
    const tab = !this.notificationCount ? 'tab-list' : 'tab-notifications'
    this.$store.commit('Common/setDrawer', { value: true, tab })
    this.click()
  }

  get route() {
    return this.$route.meta
  }

  get drawerOpenModel() {
    return (this as any).drawerOpen
  }
  set drawerOpenModel(value: boolean) {
    this.$store.commit('Common/setDrawer', { value })
  }

  get tabModel() {
    return this.tab
  }

  set tabModel(value: string) {
    this.$store.commit('Common/setTab', value)
  }

  dismiss(id: string) {
    const { dispatch, commit } = this.$store
    dispatch('Common/playWoosh')
    commit('Common/Notifications/dismiss', id)
  }

  notify() {
    const { dispatch } = this.$store
    this.click()
    dispatch('Common/Notifications/notify', {
      text: 'Hello World. ' + new Date().toString()
    })
  }

  dismissAll() {
    const { dispatch } = this.$store
    dispatch('Common/playWoosh')
    dispatch('Common/Notifications/dismissAll')
  }

  removeAll() {
    const { dispatch } = this.$store
    dispatch('Common/playWoosh')
    dispatch('Common/Notifications/removeAll')
  }

  back() {
    this.$router.go(-1)
  }

  toggleDarkMode() {
    this.click()
    this.$store.dispatch('Common/Settings/toggleTheme')
  }

  toggleExpertMode() {
    this.click()
    this.$store.dispatch('Common/Settings/toggleMode')
  }

  async refreshWallets() {
    const { dispatch, commit } = this.$store
    dispatch('Wallet/updateWallets')
  }

  // verifyAccount() {}

  get size() {
    const size = { xs: 'x-small', sm: 'small', lg: 'large', xl: 'x-large' }[
      this.$vuetify.breakpoint.name
    ]
    return size ? { [size]: true } : {}
  }
}
</script>

<style>
.app__speeddial .v-badge__badge {
  top: -20px;
  right: -20px;
}
</style>

<style lang="scss" scoped>
.v-speed-dial {
  position: fixed;
  z-index: 20;

  .v-btn--fab {
    position: relative;
    top: 2px;

    @media screen and (max-width: 960px) {
      top: 2px;
      right: -5px;
    }

    @media screen and (max-width: 600px) {
      top: -6px;
      right: -7px;
    }
  }
}
.main-app-bar {
  // there's a bug in the default z-index options
  z-index: 20 !important;

  .nav-bar.no--shadow & {
    box-shadow: none !important;
  }
}
.main-nav-drawer {
  // there's a bug in the default z-index options
  z-index: 21 !important;
}
.title {
  display: flex;

  svg {
    transform: scale(0.85);
  }
}

.wallet-selector {
  position: relative;
}
.wallet-selector__menu-btn {
  position: absolute;
  top: 50%;
  right: 10px;
  transform: translateY(-50%);
  z-index: 100;
}
</style>
