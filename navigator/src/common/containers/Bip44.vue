<!-- @format -->

<template>
  <Page>
    <PageContent :disabled="forging || updating">
      <v-text-field
        v-model="mnemonic"
        label="Master mnemonic (12 words)"
        hint="Enter mnemonic or generate a random phrase"
        append-icon="shuffle"
        @click:append="shuffle"
      />
      <v-text-field
        v-model="form.hexSeed"
        label="Master hexSeed"
        append-icon="shuffle"
        @click:append="shuffle"
      />

      <v-row class="ma-0">
        <v-text-field v-model="form.path" label="Child derivationPath" disabled />
        <v-btn small text class="mt-3 mb-n1" @click="setCoin(tonCode)">
          TON
        </v-btn>
        <v-btn small text class="mt-3 mb-n1" @click="setCoin(gramCode)">
          GRAM
        </v-btn>
        <v-btn icon class="mt-4 ml-2" x-small @click="add(-1)">
          <v-icon v-text="'remove'" />
        </v-btn>
        <v-btn x-small class="mt-4" icon @click="add()">
          <v-icon v-text="'add'" />
        </v-btn>
      </v-row>
      <v-text-field
        v-if="childKeys && childKeys.privateKey"
        v-model="childKeys.privateKey"
        label="Child Private Key"
        disabled
      />
    </PageContent>

    <!-- Footer -->
    <PageFooter :padding="true">
      <v-row dense>
        <v-col>
          <v-btn large block type="button" @click="shuffle">
            Random
            <v-icon right>
              shuffle
            </v-icon>
          </v-btn>
        </v-col>

        <v-col>
          <v-btn
            type="button"
            large
            block
            :class="{ 'half-transparent unclickable': error }"
            :color="error ? 'error' : 'primary'"
            :loading="forging || updating"
            @click="getWallet"
          >
            Create
            <v-icon right>
              account_balance_wallet
            </v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </PageFooter>
  </Page>
</template>

<script lang="ts">
import { Component, Vue, Emit, Watch } from 'vue-property-decorator'
import Page from '@/common/components/Page.vue'
import PageContent from '@/common/components/PageContent.vue'
import PageFooter from '@/common/components/PageFooter.vue'
import store, { notify, RootState } from '@/common/store'
import { handleError, addTimeoutToPromise } from '@/common/lib/error-handling'
import { CreateWalletOptions, Wallet } from '@/common/store/Wallet/Wallet'
import { makeid } from '@/common/lib/makeid'
import { mapState } from 'vuex'
import { AddressObj, FIXT, AccountInfo } from '@gram-net/wasm'
import WalletItem from '@/common/modules/wallet/components/WalletItem.vue'
import WalletSummary from '@/common/components/WalletSummary.vue'
import { gram } from '@/common/lib/format'
import { gramCode, tonCode, forgeTimeout } from '@/common/lib/constants'
import QRCode from 'qrcode'
import { getMnemonic, toSeedHex, getKeys, GeneratedKeys } from '@/common/lib/bip44'

@Component({
  filters: {
    gram
  },
  computed: {
    ...mapState<RootState>({
      GramWasm: (state) => state.GramWasm,
      forging: (state) => state.Wallet.forging,
      updating: (state) => state.Wallet.forging
    })
  },
  components: {
    Page,
    PageContent,
    PageFooter,
    WalletItem,
    WalletSummary
  }
})
export default class Bip44 extends Vue {
  loading = false
  forging!: boolean
  udpating!: boolean
  GramWasm!: RootState['GramWasm']
  gramCode = gramCode
  tonCode = tonCode
  wallet: Wallet | null = null

  private formModel = {
    hexSeed: '',
    mnemonic: '',
    path: `m/44'/${tonCode}'/0'`
  }

  get form() {
    return this.formModel
  }

  set form(value) {
    let hexSeed = this.formModel.hexSeed
    if (value.mnemonic !== this.formModel.mnemonic) {
      hexSeed = toSeedHex(value.mnemonic)
    }
    this.formModel = {
      ...value,
      hexSeed
    }
  }

  get mnemonic() {
    return this.form.mnemonic
  }

  set mnemonic(mnemonic) {
    this.form = {
      ...this.form,
      mnemonic
    }
  }

  get error() {
    return !this.childKeys || !this.masterKeys
  }

  mounted() {
    this.$store.commit('Common/stopLoading')
    this.shuffle()
  }

  keyToHex(key: Buffer | Uint8Array) {
    return key.toString('hex')
  }

  shuffle() {
    this.form = {
      ...this.form,
      mnemonic: getMnemonic('english', 12)
    }
  }

  mnemonicToSeedHex(value: string = this.form.mnemonic) {
    this.form.hexSeed = toSeedHex(value)
  }

  get masterKeys() {
    if (!this.form.hexSeed) return null
    try {
      return getKeys(this.form.hexSeed)
    } catch (error) {
      console.warn(error.message)
      return null
    }
  }

  get childKeys() {
    if (!this.form.hexSeed) return null
    try {
      return getKeys(this.form.hexSeed, this.form.path)
    } catch (error) {
      console.warn(error.message)
      return null
    }
  }

  setCoin(coin: number | string) {
    try {
      const parts = this.form.path.split('/')
      let part: number | string = parts[2]
      let tick = false
      if (part[part.length - 1] === "'") {
        part = part.substring(0, part.length - 1)
        tick = true
      }
      part = +part
      parts[2] = coin + (tick ? "'" : '')
      this.form.path = parts.join('/')
    } catch (error) {
      handleError(error, 'Invalid path')
    }
  }

  async getWallet() {
    const { dispatch, commit } = store
    if (this.error || this.loading || !this.childKeys) return

    const key = await dispatch.Wallet.getKey()
    commit.Wallet.addKey(key)
    try {
      await addTimeoutToPromise(
        dispatch.Wallet.forgeWallet({
          key,
          Uint8ArrayImport: this.childKeys.key
        }),
        forgeTimeout
      )
    } catch (error) {
      commit.Wallet.setForging(false)
      handleError(error, error, 6000)
    }
  }

  add(value = 1) {
    try {
      const parts = this.form.path.split('/')
      let last: number | string = parts[parts.length - 1]
      let tick = false
      if (last[last.length - 1] === "'") {
        last = last.substring(0, last.length - 1)
        tick = true
      }
      last = +last
      parts[parts.length - 1] = last + 1 * value + (tick ? "'" : '')
      this.form.path = parts.join('/')
    } catch (error) {
      handleError(error, 'Invalid path')
    }
  }
}
</script>
