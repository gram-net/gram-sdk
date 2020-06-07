<!-- @format -->

<template>
  <Page>
    <PageContent>
      <div class="text-center pb-2">
        <v-avatar :size="90" @click="$router.push('/wallet')">
          <identicon :size="90" :seed="wallet.addressObj.baddr" />
        </v-avatar>
        <v-list-item-title class="mt-3">
          {{ wallet.name }}
        </v-list-item-title>
        <v-btn text small color="primary" @click="changeName">
          Change Name
        </v-btn>
      </div>

      <v-list class="list--clean">
        <v-divider class="my-1" />

        <v-list-item>
          <v-list-item-content>
            <v-list-item-subtitle>Network</v-list-item-subtitle>
            <v-list-item-title class="mt-1">
              {{ wallet.network.name }}
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-divider class="my-1" />
        <v-list-item>
          <v-list-item-content>
            <v-list-item-subtitle class="d-flex align-center">
              <span class="clickable pr-3" @click="menu = true">Color</span>

              <v-menu
                v-model="menu"
                bottom
                nudge-left="45"
                nudge-top="10"
                :close-on-content-click="false"
              >
                <template v-slot:activator="{ on }">
                  <span
                    :style="{ 'background-color': color }"
                    class="selected-color"
                    v-on="on"
                  />
                </template>
                <v-card>
                  <v-card-text class="pa-0">
                    <v-color-picker
                      v-model="color"
                      :swatches="swatches"
                      show-swatches
                      flat
                    />
                  </v-card-text>
                </v-card>
              </v-menu>
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
        <v-divider class="my-1" />
        <v-subheader class="px-0 mb-n1 mt-2">
          Backup
          <v-spacer />
          <v-btn v-if="wallet.backedUp" text small color="success" @click="backup">
            Backed up
            <v-icon right>
              check
            </v-icon>
          </v-btn>
        </v-subheader>
        <div
          v-show="!wallet.backedUp && !wallet.imported"
          class="clickable mt-2 mb-3"
          @click="$router.push('/wallet/backup?redirect=/wallet/settings')"
        >
          <backup-warning />
        </div>

        <v-list-item v-if="key && wallet.path">
          <v-list-item-content>
            <v-list-item-title class="d-flex align-center">
              Secret phrase / derivation path
              <v-spacer />
              <v-btn
                :input-value="panels.phrase"
                class="half-transparent"
                text
                small
                @click="reveal('phrase')"
              >
                Reveal
                <v-icon right v-text="!panels.phrase ? 'lock' : 'lock_open'" />
              </v-btn>
            </v-list-item-title>
            <v-expand-transition>
              <div v-show="panels.phrase">
                <v-text-field
                  readonly
                  append-icon="file_copy"
                  solo
                  class="has--copy mt-3 mb-n7"
                  label="Address"
                  :value="mnemonic"
                  @click:append="copy(mnemonic)"
                />
                <v-text-field
                  readonly
                  append-icon="file_copy"
                  solo
                  class="has--copy mt-2 mb-n7"
                  label="Address"
                  :value="wallet.path"
                  @click:append="copy(wallet.path)"
                />
              </div>
            </v-expand-transition>
          </v-list-item-content>
        </v-list-item>
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title class="d-flex align-center">
              Private key
              <v-spacer />
              <v-btn
                :input-value="panels.pk"
                text
                class="half-transparent"
                small
                @click="reveal('pk')"
              >
                Reveal
                <v-icon right v-text="!panels.pk ? 'lock' : 'lock_open'" />
              </v-btn>
            </v-list-item-title>
            <v-expand-transition>
              <div v-show="panels.pk">
                <v-text-field
                  readonly
                  append-icon="file_copy"
                  prepend-inner-icon="cloud_download"
                  solo
                  class="has--copy mt-3 mb-n7"
                  label="Address"
                  :value="privateKey"
                  @click:append="copy(privateKey)"
                  @click:prepend-inner="downloadKey()"
                />
                <div v-if="qr" class="qr-well mt-2">
                  <img class="img-full" :src="qr" />
                </div>
              </div>
            </v-expand-transition>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </PageContent>

    <PageFooter :padding="true">
      <v-btn large color="error" block @click="remove">
        Remove
        <v-icon right v-text="'warning'" />
      </v-btn>
    </PageFooter>
  </Page>
</template>

<script lang="ts">
import { Component, Vue, Emit, Watch } from 'vue-property-decorator'
import Page from '@/common/components/Page.vue'
import BackupWarning from '@/common/modules/wallet/components/BackupWarning.vue'
import Identicon from '@/common/modules/wallet/components/Identicon.vue'
import PageContent from '@/common/components/PageContent.vue'
import PageFooter from '@/common/components/PageFooter.vue'
import store, { notify, RootState } from '@/common/store'
import { mapState } from 'vuex'
import { Wallet, MasterKey } from '@/common/store/Wallet/Wallet'
import QRCode from 'qrcode'
import { colors } from 'vuetify/lib'
import { getColor } from '../../../lib/identicon'
import { decrypt } from '@/common/lib/crypto'

@Component({
  computed: {
    ...mapState<RootState>({
      keystore: ({ Wallet }) => Wallet.keystore
    })
  },
  components: {
    Page,
    PageContent,
    PageFooter,
    BackupWarning,
    Identicon
  }
})
export default class Backup extends Vue {
  keystore!: MasterKey[]
  qr = ''
  hex = ''

  colorModel = '#00AA0'
  mask = '!#XXXXXXXX'
  menu = false
  defaultColor = getColor(this.wallet.addressObj.baddr)
  swatches = [
    [this.defaultColor],
    [this.$vuetify.theme.currentTheme.primary],
    [this.$vuetify.theme.currentTheme.error],
    [this.$vuetify.theme.currentTheme.accent],

    [this.$vuetify.theme.currentTheme.success]
  ]

  async reveal(key: string) {
    if (this.panels[key]) {
      this.panels[key] = false
      return
    }
    try {
      const pin = await store.dispatch.Common.Login.promptPin()
      this.panels[key] = true
    } catch {
      // closed dialog
    }
  }

  get color() {
    return this.wallet.color || (this.$vuetify.theme.currentTheme.primary as string)
  }
  set color(value: string) {
    store.commit.Wallet.patchWallet({
      id: this.wallet.id,
      update: { color: value }
    })
    this.$route.meta.toolbarType = value
  }

  panels = {
    phrase: false,
    pk: false
  }

  async backup() {
    try {
      const pin = await store.dispatch.Common.Login.promptPin()
      this.$router.push('/wallet/backup?redirect=' + this.$route.path)
    } catch {
      // closed dialog
    }
  }

  get wallet() {
    return store.getters.Wallet.wallet as Wallet
  }

  beforeMount() {
    if (!this.wallet) this.$router.push('/wallets')
  }

  mounted() {
    this.$store.commit('Common/stopLoading')
    const authorizedPanel = this.$route.query.authorizedPanel as string
    if (authorizedPanel) {
      this.panels[authorizedPanel] = true
    }
    this.keytoQR()
  }

  get key() {
    return (this.keystore || []).find((k) => k.id === this.wallet.masterKeyId)
  }

  downloadKey(key = this.privateKey, name = `${this.wallet.name}.pk`) {
    const { dispatch } = store
    const payload = { value: key, name, encoding: 'hex' }
    dispatch.Common.downloadString(payload)
  }

  downloadQR(qr = this.qr, name = `${this.wallet.name}.png`) {
    const { dispatch } = this.$store
    dispatch('Common/downloadURL', { url: qr, name })
  }

  copy(str: string) {
    const { dispatch } = this.$store
    dispatch('Common/copy', str)
  }

  get mnemonic() {
    const decrypted = decrypt(
      (this.key as MasterKey).mnemonic,
      store.state.Common.Login.pin as string
    )
    return decrypted
  }

  get privateKey() {
    return decrypt(this.wallet.key, store.state.Common.Login.pin as string)
  }

  async changeName() {
    const { commit, state } = store
    const name = await this.$dialog.prompt({
      title: 'Enter a new name'
    })
    const exists = state.Wallet.wallets
      .filter((w) => w.id !== this.wallet.id)
      .map((w) => w.name)
      .find((n) => n === name)
    if (!name) {
      return
    } else if (exists) {
      notify({
        text: 'A wallet with this name already exists',
        duration: 2000,
        type: 'error'
      })
      this.changeName()
    } else {
      commit.Wallet.patchWallet({ id: this.wallet.id, update: { name } })
    }
  }

  @Watch('wallet')
  async keytoQR() {
    const { dispatch } = this.$store
    if (!this.wallet) {
      this.qr = ''
    } else {
      this.qr = await dispatch('Common/getQR', this.privateKey)
    }
  }

  remove() {
    const { dispatch } = this.$store
    dispatch('Wallet/removeWallet', this.wallet)
  }
}
</script>

<style lang="scss" scoped>
.animate-blur {
  transition: background 0.3s ease, filter 0.3s ease;
}
.unrevealed {
  filter: blur(10px);
  opacity: 0.5;
  pointer-events: none;
}
</style>

<style>
.selected-color {
  cursor: pointer;
  height: 27px;
  width: 27px;
  border-radius: 50%;
  display: inline-block;
}
</style>
