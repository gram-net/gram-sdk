<!-- @format -->

<template>
  <Page>
    <PageHeader :width="500">
      <v-text-field
        ref="amount"
        v-model.number="form.amount"
        type="number"
        label="0"
        single-line
        :max="maxAmount"
        :min="0"
        height="4rem"
        solo
        light
        class="type--large mt-3 mb-n1"
        persistent-hint
        :append-icon="wallet.network.symbol"
        :hint="amountHint"
        :error="fieldError('amount').length > 0"
        :error-messages="fieldError('amount')"
        @click:append="
          wallets.length > 1 ? selectWallet : $router.push({ path: '/wallet/create' })
        "
      />
    </PageHeader>
    <PageContent :width="500">
      <div>
        <input ref="qr" type="file" accept="image/png" hidden @change="readQr" />

        <v-combobox
          v-model="form.addr"
          :items="comboboxItems"
          label="Recipient Address"
          :append-outer-icon="icons.qrcode"
          :hide-no-data="true"
          item-value="addr"
          :return-object="false"
          :error-messages="fieldError('addr')"
          @click:append-outer="scanQr"
        >
          <template v-slot:item="{ index, item }">
            <v-list-item-content style="flex-grow: 4; max-width: 320px;">
              <div class="combobox__content__max-width">
                {{ item.name }}
              </div>
              <v-list-item-subtitle>
                {{ item.addr }}
              </v-list-item-subtitle>
            </v-list-item-content>

            <v-spacer />
            <v-list-item-action class="text-right">
              <v-list-item-action-text v-if="item.type === 'wallet'">
                {{ item.balance | gram(true, item.symbol) }}
              </v-list-item-action-text>
              <v-list-item-action-text v-if="item.type === 'history'">
                history
              </v-list-item-action-text>
            </v-list-item-action>
          </template>
        </v-combobox>

        <!--
        <v-textarea
          label="Comment (optional)"
          v-model="form.comment"
          :rows="2"
        />-->

        <v-list class="list--clean mt-n2">
          <v-list-item class="pl-0 pr-0">
            <v-list-item-content>
              <v-list-item-subtitle v-text="'Fee (estimate)'" />
            </v-list-item-content>
            <v-list-item-action>
              <v-list-item-action-text class="text-right">
                {{ fee | gram(false, wallet.network.symbol) }}
              </v-list-item-action-text>
            </v-list-item-action>
          </v-list-item>
          <v-divider />
          <v-list-item class="pl-0 pr-0">
            <v-list-item-content>
              <v-list-item-subtitle v-text="'Total (estimate)'" />
            </v-list-item-content>
            <v-list-item-action>
              <v-list-item-action-text class="text-right">
                {{ total | gram(false, wallet.network.symbol) }}
              </v-list-item-action-text>
            </v-list-item-action>
          </v-list-item>
          <v-divider />
        </v-list>
      </div>
    </PageContent>

    <PageFooter :padding="true">
      <v-btn block large color="primary" :loading="loading" @click="submit">
        <span class="mt-n1">
          Send
          {{ form.amount | gram(false, wallet.network.symbol) }}
        </span>
      </v-btn>
      <!-- <SwipeBtn @confirm="submit" initialText="Continue" /> -->
    </PageFooter>
  </Page>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import Page from '@/common/components/Page.vue'
import PageFooter from '@/common/components/PageFooter.vue'
import PageContent from '@/common/components/PageContent.vue'
import PageHeader from '@/common/components/PageHeader.vue'
import { mapState } from 'vuex'
import { WalletState, Wallet, PendingTransaction } from '@/common/store/Wallet/Wallet'
import SwipeBtn from '@/common/components/SwipeBtn.vue'
import { LoadingState } from '@/common/store/Common/Loading'
import { gram } from '@/common/lib/format'
import { nanoFactor, fee, symbol } from '@/common/lib/constants'
import { mdiQrcode } from '@mdi/js'
import {
  HTMLInputEvent,
  openFileAsBuffer,
  openFile,
  readQr,
  cordovaReadQr
} from '@/common/lib/open-file'
import jsQR from 'jsqr'
import QrScanner from 'qr-scanner'
import store, { RootState, notify } from '@/common/store'
import getPlatform, { Platform } from '@/common/lib/get-platform'
import { handleError } from '@/common/lib/error-handling'

@Component({
  components: {
    Page,
    PageFooter,
    PageContent,
    PageHeader,
    SwipeBtn
  },
  filters: {
    gram
  },
  computed: {
    ...mapState<RootState>({
      loading: (state) => state.Common.Loading.loading,
      pendingTransaction: (state) => state.Wallet.pendingTransaction,
      wallets: (state) => state.Wallet.wallets
    })
  }
})
export default class Send extends Vue {
  loading!: boolean
  symbol = symbol
  isCordova = getPlatform() === Platform.Cordova
  readonly defaultForm = {
    amount: null as null | number,
    comment: '',
    addr: '',
    touched: false,
    fee
  }
  form = { ...this.defaultForm }
  icons = {
    qrcode: mdiQrcode
  }
  wallets!: Wallet[]
  pendingTransaction!: PendingTransaction
  $refs!: {
    qr: HTMLInputElement
  }

  get comboboxItems() {
    const { getters } = store
    const fromWallet = store.state.Wallet.wallets.map((w) => ({
      addr: w.addressObj.baddr,
      name: w.name,
      type: 'wallet',
      symbol: w.network.symbol
    }))
    const fromHistory = getters.Wallet.usedAddresses
      .map((addr) => ({
        name: '',
        addr,
        type: 'history',
        symbol: null
      }))
      .filter((item) => !fromWallet.map((w) => w.addr).includes(item.addr))
    return [...fromHistory, ...fromWallet].filter(
      (item) => this.wallet.addressObj.baddr !== item.addr
    )
  }

  get wallet() {
    return store.getters.Wallet.wallet as Wallet
  }

  get addresses() {
    return store.getters.Wallet.usedAddresses
  }

  beforeMount() {
    if (!this.wallet) {
      this.$router.push({
        path: '/wallet/create'
      })
    } else if (this.pendingTransaction) {
      this.form.amount = this.pendingTransaction.amount
        ? this.pendingTransaction.amount / nanoFactor
        : null
      this.form.comment = this.pendingTransaction.comment || ''
      this.form.addr = this.pendingTransaction.toAddr
    }
  }

  resetForm() {
    this.form = { ...this.defaultForm }
  }

  get amountHint() {
    return `${gram(this.wallet.balance || 0, true, this.wallet.network.symbol)} available`
  }

  get fieldError() {
    return (field: string) =>
      this.form.touched && this.hasError && this.error[field] ? [this.error[field]] : []
  }

  selectWallet() {
    this.$router.push({
      path: '/wallets',
      query: {
        redirect: this.$route.path
      }
    })
  }

  get fee() {
    return fee
  }

  get total() {
    return +(this.form.amount || 0) + this.fee
  }

  scanQr() {
    if (this.isCordova) this.cordovaReadQr()
    else this.$refs.qr.click()
  }

  async cordovaReadQr() {
    try {
      const qr = await cordovaReadQr()
      if (qr && qr.length > 0) {
        this.form.addr = qr
      }
      console.log(qr)
    } catch (error) {
      handleError(error, error)
    }
  }

  async readQr(event: HTMLInputEvent) {
    const file = event.target.files && event.target.files[0]
    const { dispatch } = this.$store
    const notify = (text = 'Not a valid QR code. Please try again', error?: any) =>
      dispatch('Common/Notifications/notify', {
        text,
        duration: 2500,
        type: 'info',
        payload: { error }
      })

    if (file) {
      try {
        const qr = await readQr(file)
        if (qr && qr.data) {
          this.form.addr = qr.data
        }
      } catch (error) {
        handleError(error, error)
      }
    }
  }

  get maxAmount() {
    return +(this.wallet.balance || 0) / nanoFactor
  }

  get error() {
    let error: { [key: string]: string } = {}

    if ((this.form.amount || 0) <= 0) {
      error.amount = 'Amount is required'
    }
    if (this.wallet && (this.form.amount || 0) > this.maxAmount) {
      error.amount = 'Amount exceeds balance ' + this.amountHint
    }
    if (!this.wallet) {
      error.amount = 'Please select a Wallet'
    }
    if (!this.form.addr) {
      error.addr = 'Please select a recipient address'
    }
    if (this.form.addr === this.wallet.addressObj.baddr) {
      error.addr = "You can't send to yourself"
    }

    return error
  }

  get hasError() {
    return Object.keys(this.error).length > 0
  }

  touch() {
    this.form.touched = true
  }

  mounted() {
    this.$store.commit('Common/stopLoading')
    setTimeout(() => {
      ;(this.$refs as any).amount.focus()
    }, 200)
  }

  submit() {
    const { dispatch, commit } = this.$store
    const { form, error } = this
    this.touch()

    if (this.hasError) {
      const firstError = Object.values(this.error).find((item) => !!item)
      notify({
        text: firstError as string,
        duration: 2500,
        type: 'error',
        payload: { form, error }
      })
    } else {
      const transaction: PendingTransaction = {
        amount: (this.form.amount || 0) * nanoFactor,
        comment: this.form.comment,
        fromAddr: this.wallet.addressObj.baddr,
        toAddr: this.form.addr
      }
      commit('Wallet/setPendingTransaction', transaction)
      this.resetForm()
      this.$router.push('/wallet/receipt')
    }
  }
}
</script>

<style lang="scss" scoped>
.combobox__content__max-width {
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
