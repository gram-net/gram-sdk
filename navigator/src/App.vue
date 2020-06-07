<!-- @format -->

<template>
  <div
    class="main-content"
    :data-show-toolbar="$route.meta.showToolbar ? 'true' : 'false'"
    :data-loading="loading ? 'true' : 'false'"
    :data-help-mode="help.open ? 'true' : 'false'"
    :data-help-step="activeHelpStep.id"
    :data-help-overlay="activeHelpStep.overlay ? 'true' : 'false'"
  >
    <v-app>
      <LoadingOverlay />
      <NavBar />
      <aside class="notifications">
        <div
          v-for="notification of drawerOpen
            ? []
            : [...notifications].reverse().slice(0, 30)"
          :key="notification.id"
          class="clickable"
          style="opacity: 0.9;"
          @click="dismiss(notification.id)"
        >
          <Notification
            :notification="notification"
            :show="!notification.timeDismissed"
            :elevation="5"
          />
        </div>
      </aside>

      <div class="main-content__wrap">
        <div class="main-content__wrap__help">
          <Help />
        </div>

        <transition name="page" mode="out-in">
          <router-view class="main-content__wrap__view" />
        </transition>

        <div class="main-content__wrap__loader">
          <v-progress-circular :size="55" indeterminate color="yellow" />
        </div>
      </div>

      <!-- modals -->
      <div>
        <BaseDialog
          v-model="modals.network"
          title="Add Network"
          :width="600"
          name="modal-network"
          @back="openModal('network')"
        >
          <AddNetwork @submit="addNetwork" />
        </BaseDialog>

        <v-dialog v-model="pinDialog" fullscreen>
          <v-card class="pin-prompt">
            <v-app-bar elevation="0" color="transparent">
              <v-btn icon @click="pinDialog = false">
                <v-icon>close</v-icon>
              </v-btn>
              <v-spacer />

              <v-toolbar-title class="title">
                <span>Enter PIN</span>
              </v-toolbar-title>
              <v-spacer />
              <v-btn icon class="d-transparent unclickable" @click="pinDialog = false">
                <v-icon>close</v-icon>
              </v-btn>
            </v-app-bar>
            <div class="pin-prompt__container">
              <PinPad v-model="pin" @submit="submitPin" />
            </div>
          </v-card>
        </v-dialog>
      </div>
    </v-app>
  </div>
</template>

<style>
.tigerbee {
  height: inherit;
}
</style>

<script lang="ts">
import 'reflect-metadata'
import BaseDialog from '@/common/components/BaseDialog.vue'
import NavBar from '@/common/components/NavBar.vue'
import PinPad from '@/common/components/PinPad.vue'
import { Watch, Component, Vue } from 'vue-property-decorator'
import omit from 'lodash/omit'
import { mapState, mapGetters } from 'vuex'
import getPlatform, { Platform } from './common/lib/get-platform'
import { base } from '@/common/lib/cordova-fs'
import Notification from '@/common/components/Notification.vue'
import Help from '@/common/components/Help.vue'
import LoadingOverlay from '@/common/components/LoadingOverlay.vue'
import AddNetwork from '@/common/modules/wallet/components/AddNetwork.vue'
import {
  Notification as NotificationModel,
  NotificationOptions
} from '@/common/models/notification'
import { NOTIFICATIONS_ACTIVE, DISMISS_ALL } from './common/store/Common/Notifications'
import {
  addTimeoutToPromise,
  handleError,
  handleTimeout
} from '@/common/lib/error-handling'
import store, { RootState } from './common/store'
import { Network } from './common/models/network'
import { makeid } from './common/lib/makeid'
import { Wallet } from './common/store/Wallet/Wallet'
import { PinEventBus } from './common/store/Common/Login'
const { state, commit, dispatch, getters } = store

@Component({
  components: {
    BaseDialog,
    Notification,
    NavBar,
    LoadingOverlay,
    AddNetwork,
    Help,
    PinPad
  },
  computed: {
    ...mapState<RootState>({
      platform: (state) => state.TappletLauncher.platform,
      wallet: (state) => state.Wallet.wallet,
      drawerOpen: (state) => state.Common.NavBar.drawerOpen,
      loading: (state) => state.Common.Loading.loading,
      notifications: (state) => state.Common.Notifications.notifications
    })
  }
})
export default class App extends Vue {
  get pin() {
    return store.state.Common.Login.pinDialogForm
  }
  set pin(value) {
    store.commit.Common.Login.setPinDialogForm(value)
  }

  get pinDialog() {
    return store.state.Common.Login.pinDialog
  }
  set pinDialog(value) {
    store.commit.Common.Login.setPinDialog(value)
  }

  platform!: Platform
  wallet!: Wallet
  drawerOpen!: boolean
  appTimer: any
  pollTimer: any
  notification: any
  loading!: boolean

  // async getPinFromDialog() {}

  get help() {
    // get help :)
    return state.Common.Help
  }

  get activeHelpStep() {
    return getters.Common.Help.activeHelpStep
  }

  createModals = (vm = this) => ({
    get network() {
      return vm.isOpenModal('network')
    },
    set network(open: boolean) {
      open ? vm.openModal('network') : vm.closeModal('network')
    }
  })

  submitPin(pin: string) {
    PinEventBus.$emit('submit', pin)
  }

  destroyed() {
    if (this.platform === Platform.Cordova) {
      this.$store.dispatch('TappletLauncher/stopServer')
    }

    clearInterval(this.appTimer)
    clearInterval(this.pollTimer)
  }

  async mounted() {
    const { dispatch, commit } = this.$store

    dispatch('Common/Notifications/' + DISMISS_ALL)
    this.appTimer = setInterval(this.timer, 1000)
    this.pollTimer = setInterval(this.poll, 1000 * 60 * 3)
    dispatch('Common/Settings/initTheme')
    this.timer()
    this.poll()

    if (this.$store.state.Console.logging) {
      commit('Console/enableLogging')
    }

    if (this.platform === Platform.Cordova) {
      const cb = async () => {
        await dispatch('TappletLauncher/setFs')
        const url = await dispatch('TappletLauncher/startServer', {
          www_root: 'tapplets',
          port: 3000 + Math.round(Math.random() * 100),
          localhost_only: false
        })
        console.log('[startServer]', url)
      }
    } else if (this.platform === Platform.Electron) {
      // electron code
    }

    console.log('[platform]', getPlatform())
  }

  modals = this.createModals()

  isOpenModal(name: string) {
    const q = this.$route.query
    return !!(q && q.modal && q.modal === name)
  }

  addNetwork(network: Network) {
    const { commit, state } = this.$store
    const newNetwork = { ...network, id: makeid(20) }
    commit('Wallet/addNetwork', newNetwork)
    this.closeModal('network')
  }

  poll() {
    const { dispatch } = this.$store
    console.log('[polling] Updating wallets...')
    dispatch('Wallet/updateWallets')
  }

  async timer() {
    const { commit, state, dispatch } = this.$store
    const oldVal = state.Common.Loading.online
    const { onLine } = navigator

    if (oldVal !== onLine) {
      if (this.notification) this.notification.dismiss()
      commit('Common/setOnline', onLine)
      const { notification } = !onLine
        ? await handleError(
            null,
            "You're offline. Make sure you're connected to the internet and try again.",
            2500,
            true
          )
        : await dispatch('Common/Notifications/notify', {
            text: "You're back online",
            type: 'success',
            duration: 2500,
            payload: { onLine }
          })
      if (onLine) {
        this.$router.back()
      }
      this.notification = notification
    }
  }

  openModal(name: string) {
    if (this.isOpenModal(name)) return
    this.$router.push({ query: { modal: name } })
  }

  closeModal(name: string, params: string[] = []) {
    if (!this.isOpenModal(name)) return
    const query = omit(this.$route.query, 'modal', ...params)
    this.$router.replace({ query })
    this.$store.dispatch('Common/playWoosh')
  }

  dismiss(id: string) {
    this.$store.commit('Common/Notifications/dismiss', id)
    this.$store.dispatch('Common/playWoosh')
  }
}
</script>

<style lang="scss">
.page {
  &-enter-active,
  &-leave-active {
    transition: opacity 0.25s, transform 0.25s;
    overflow: hidden;
  }

  &-enter,
  &-leave-active {
    opacity: 0;
    transform: translateX(-30%);
    overflow: hidden;
  }
}
</style>

<style lang="scss" scoped>
.notifications {
  position: fixed;
  width: 100%;
  max-width: 300px;
  top: 1rem;
  right: 1rem;
  z-index: 9200;
}

.main-content {
  &__wrap {
    height: 100%;
    display: flex;
    flex-direction: column;
    transition: padding 0.3s ease;

    [data-show-toolbar='true'] & {
      padding-top: 56px;

      @media screen and (min-width: 900px) {
        padding-top: 64px;
      }
    }

    &__view {
    }

    &__loader {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: -1;
    }
  }
}

.pin-prompt {
  $dark: rgba(#121212, 1);
  $light: rgba(#fff, 1);
  background: $dark;
  border-radius: 0 !important;
  .theme--light & {
    background: $light;
  }

  &__container {
    max-width: 400px;
    margin: auto;
    padding: 1rem 1rem 0;
  }
}
</style>
