<!-- @format -->

<template>
  <Page v-if="wallet">
    <PageHeader :padding="false">
      <v-tabs
        v-model="tab"
        class="mt-6"
        :mobile-break-point="500"
        color="white"
        centered
        background-color="primary"
      >
        <v-tab v-for="item in items" :key="item.tab">
          {{ item.title }}
        </v-tab>
      </v-tabs>
    </PageHeader>

    <PageContent>
      <v-tabs-items v-model="tab">
        <v-tab-item key="One">
          <v-text-field
            readonly
            append-icon="file_copy"
            solo
            class="has--copy"
            label="Address"
            :value="wallet.addressObj.baddr"
            @click:append="copy(wallet.addressObj.baddr)"
          />

          <div class="qr-well">
            <img class="img-full" :src="qr" :alt="wallet.addressObj.baddr" />
          </div>
        </v-tab-item>

        <v-tab-item key="Two">
          <v-text-field
            ref="amount"
            v-model.number="form.amount"
            class="type--large mb-n7"
            type="number"
            label="0"
            single-line
            :min="0"
            height="4rem"
            solo
            :error="error.amount.length > 0"
            :error-messages="error.amount"
            :append-icon="symbol"
          />
          <v-textarea
            v-model="form.comment"
            rows="1"
            auto-grow
            single-line
            label="Comment (optional)"
            :error="error.comment.length > 0"
            :error-messages="error.comment"
            :counter="form.maxCommentSize"
            class="mb-3"
          />
          <v-list-item-subtitle class="mb-2 slightly-transparent">
            Invoice URL
          </v-list-item-subtitle>
          <v-text-field
            readonly
            append-icon="file_copy"
            solo
            class="has--copy"
            label="Address"
            :value="invoiceURL"
            @click:append="copy(invoiceURL)"
          />

          <div class="qr-well" @click="downloadInvoiceQR()">
            <img class="img-full" :src="invoiceQr" :alt="invoiceURL" />
          </div>
        </v-tab-item>
      </v-tabs-items>
    </PageContent>

    <PageFooter :padding="true" hidden>
      <v-row dense>
        <v-col class="py-0">
          <v-btn
            block
            large
            @click="form.amount !== null ? downloadInvoiceQR() : downloadAddressQR()"
          >
            {{ form.amount !== null ? 'QR' : 'QR' }}
            <v-icon right>
              cloud_download
            </v-icon>
          </v-btn>
        </v-col>
        <v-col class="py-0">
          <v-btn
            block
            large
            color="primary"
            @click="form.amount !== null ? shareInvoice() : copy(wallet.addressObj.baddr)"
          >
            {{ form.amount !== null ? 'Copy URL' : 'Copy Address' }}
            <v-icon right>
              file_copy
            </v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </PageFooter>
  </Page>
</template>
<style lang="scss" scoped></style>

<script lang="ts">
import { Component, Vue, Emit, Watch } from 'vue-property-decorator'
import { mapState, mapActions, mapGetters } from 'vuex'
import { Wallet as WalletModel } from '@/common/store/Wallet/Wallet'
import { gram } from '@/common/lib/format'
import Page from '@/common/components/Page.vue'
import PageFooter from '@/common/components/PageFooter.vue'
import PageContent from '@/common/components/PageContent.vue'
import PageHeader from '@/common/components/PageHeader.vue'
import store, { RootState, notify } from '@/common/store'
import { symbol, nanoFactor } from '@/common/lib/constants'
import { handleError } from '../../../lib/error-handling'
import { setCache, getCache } from '@/common/lib/cache'

@Component({
  filters: {
    gram: gram
  },
  components: {
    Page,
    PageFooter,
    PageHeader,
    PageContent
  },
  methods: {},
  computed: {
    ...mapState<RootState>({
      loading: (state) => state.Common.Loading.loading
    })
  }
})
export default class Wallet extends Vue {
  loading!: boolean
  qr = ''
  invoiceQr = ''
  items = [
    { tab: 'One', title: 'Address' },
    { tab: 'Two', title: 'Invoice' }
  ]

  get wallet() {
    return store.getters.Wallet.wallet as WalletModel
  }

  private tabModel = +getCache('preferedReceiveMethod', 0)

  set tab(value: number) {
    this.tabModel = value
    setCache('preferedReceiveMethod', value)

    if (value === 1) {
      setTimeout(() => (this.$refs.amount as any).focus(), 500)
    }
  }

  get tab() {
    return this.tabModel
  }

  get symbol() {
    const { state } = store
    const { wallet } = this
    if (wallet && wallet.network) {
      return wallet.network.symbol
    } else return symbol
  }

  form = {
    amount: null as null | number,
    comment: '',
    maxCommentSize: 256,
    touched: false
  }

  beforeMount() {
    if (!this.wallet) {
      this.$router.push({
        path: '/wallets'
      })
    }
  }

  get invoiceURL() {
    const { amount, comment } = this.form
    let protocol = 'gram'
    const nanograms = (amount || 0) * nanoFactor
    const address = this.wallet.addressObj.baddr
    const text = encodeURIComponent(comment)

    if (this.wallet.network && this.wallet.network.name) {
      protocol = this.wallet.network.name.toLowerCase()
    }

    let link = `${protocol}://transfer/${address}?amount=${nanograms}`
    if (comment) link += `&text=${text}`
    return link
  }

  downloadAddressQR(qr = this.qr, name = `${this.wallet.name}-address.png`) {
    const { dispatch } = store
    dispatch.Common.downloadURL({ url: qr, name })
  }

  downloadInvoiceQR(qr = this.invoiceQr, name = `${this.wallet.name}-invoice.png`) {
    const { dispatch } = store
    dispatch.Common.downloadURL({ url: qr, name })
  }

  get error() {
    const { amount, comment, maxCommentSize, touched } = this.form
    const errors = {
      amount: [] as string[],
      comment: [] as string[]
    }

    if (amount !== null && touched) {
      if (comment.length > maxCommentSize)
        errors.comment.push(`Comment can't be longer than ${maxCommentSize} characters`)
    }

    return errors
  }

  async mounted() {
    const { commit, dispatch, state } = this.$store
    this.syncQR()
    commit('Common/stopLoading')
  }

  addInvoice() {
    this.form.amount = 1000
    setTimeout(() => (this.$refs.amount as any).focus(), 200)
  }

  removeInvoice() {
    this.form.amount = null
    this.form.touched = false
  }

  shareInvoice() {
    this.form.touched = true

    if (this.error.amount.length > 0 || this.error.comment.length > 0) {
      handleError(this.error, 'Please add a valid amount and comment')
    } else {
      this.copy(this.invoiceURL)
    }
  }

  async getQR(value?: string) {
    const { dispatch } = this.$store
    if (!value) return ''
    try {
      return await dispatch('Common/getQR', value)
    } catch (error) {
      console.warn(error)
      return ''
    }
  }

  @Watch('wallet.addressObj', { deep: true })
  @Watch('invoiceURL')
  syncQR() {
    this.getQR(this.wallet.addressObj.baddr).then((qr) => (this.qr = qr))
    this.getQR(this.invoiceURL).then((qr) => (this.invoiceQr = qr))
  }

  // destroyed() {}

  copy(str: string) {
    const { dispatch } = this.$store
    this.$store.dispatch('Common/copy', str).catch(() => {
      notify({
        text: "Couldn't copy",
        type: 'error',
        duration: 1500,
        payload: { str }
      })
    })
  }
}
</script>

<style scoped lang="scss">
.v-tabs-items {
  background: none !important;
}
.v-window-item {
  padding: 0;
}

.qr-well {
  margin-top: -8px;
}

.type--large .v-text-field__details {
  display: none !important;
}
</style>
