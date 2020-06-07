<!-- @format -->

<template>
  <Page v-if="wallet && wallet.id">
    <PageHeader :width="500" :background="$route.meta.toolbarType || ''">
      <v-list two-line subheader class="list--clean pa-0 text-center">
        <v-list-item>
          <v-list-item-content class="wallet-balance">
            <v-list-item-title class="mt-1 wallet-balance__amount">
              {{ wallet.balance | gram(true, '') }}
              <small>{{ wallet.network.symbol }}</small>
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>

      <v-row class="actions px-3 mt-3">
        <v-btn
          large
          dark
          depressed
          class="d-flex flex-grow-1"
          color="rgba(0, 0, 0, .2)"
          name="wallet-send"
          :loading="loading"
          @click="send(wallet)"
        >
          Send
          <v-icon right>
            send
          </v-icon>
        </v-btn>

        <v-btn
          large
          dark
          icon
          outlined
          class="d-flex ml-2 type--outline"
          name="wallet-receive"
          :loading="loading"
          @click="receive(wallet)"
        >
          <v-icon>{{ icons.qrcode }}</v-icon>
        </v-btn>
      </v-row>
    </PageHeader>

    <PageContent :width="500">
      <v-expand-transition>
        <div
          v-show="!wallet.backedUp && !wallet.imported"
          class="mb-6 clickable"
          @click="$router.push('/wallet/backup')"
        >
          <backup-warning />
        </div>
      </v-expand-transition>

      <v-subheader class="px-0">
        Transaction History
        <v-spacer />
        <v-btn small text class="half-transparent mr-n1" @click="update">
          update
          <v-icon
            right
            class="ml-1"
            :class="{ 'unclickable spin': updating }"
            v-text="'refresh'"
          />
        </v-btn>
      </v-subheader>

      <p v-if="transactions.length < 1" class="half-transparent py-6 ma-0 text-center">
        <span v-if="updating">Updating transactions...</span>
        <span v-else>Make your first transaction...</span>
      </p>

      <v-list v-else two-line subheader color="transparent" class="list--clean">
        <div
          v-for="(transaction, i) of transactions"
          :key="i"
          @click="openTransaction(transaction)"
        >
          <TransactionItem :transaction="transaction" :symbol="wallet.network.symbol" />
        </div>
      </v-list>
    </PageContent>
    <PageFooter :padding="true">
      <v-btn block large :disabled="loading" to="/wallet/settings">
        Settings
        <v-icon right>
          settings
        </v-icon>
      </v-btn>
    </PageFooter>
  </Page>
</template>
<style lang="scss" scoped></style>

<script lang="ts">
import { Component, Vue, Emit, Watch } from 'vue-property-decorator'
import { mapState, mapGetters } from 'vuex'
import {
  WalletState,
  Wallet as WalletModel,
  getAccount
} from '@/common/store/Wallet/Wallet'
import { LoadingState } from '@/common/store/Common/Loading'
import { gram } from '@/common/lib/format'
import TransactionItem from '@/common/modules/wallet/components/TransactionItem.vue'
import BackupWarning from '@/common/modules/wallet/components/BackupWarning.vue'
import Page from '@/common/components/Page.vue'
import PageFooter from '@/common/components/PageFooter.vue'
import PageContent from '@/common/components/PageContent.vue'
import PageHeader from '@/common/components/PageHeader.vue'
import {
  handleError,
  handleTimeout,
  addTimeoutToPromise
} from '@/common/lib/error-handling'
import store, { RootState, notify } from '@/common/store'
import { mdiQrcode } from '@mdi/js'
import stoe from '@/common/store'

import {
  Block,
  TransactionSummary,
  Transaction,
  mapTransactions
} from '@gram-net/wasm/dist/models/transaction'
import { symbol } from '@/common/lib/constants'

@Component({
  filters: {
    gram: gram
  },
  components: {
    TransactionItem,
    Page,
    PageFooter,
    PageHeader,
    PageContent,
    BackupWarning
  },
  computed: {
    ...mapState<RootState>({
      loading: ({ Common }) => Common.Loading.loading,
      updating: ({ Wallet }) => Wallet.updating,
      GramWasm: ({ GramWasm }) => GramWasm
    })
  }
})
export default class Wallet extends Vue {
  loading!: boolean
  icons = {
    qrcode: mdiQrcode
  }
  GramWasm!: RootState['GramWasm']
  updating!: boolean
  symbol = symbol

  get wallet() {
    const { getters } = store
    return getters.Wallet.wallet as WalletModel
  }

  async remove() {
    const { dispatch } = this.$store
    dispatch('Wallet/removeWallet', this.wallet)
  }

  beforeMount() {
    if (!this.wallet || !this.wallet.id) {
      this.$router.push({
        path: '/wallets'
      })
    }
  }

  async mounted() {
    const { commit, dispatch, state, direct } = this.$store
    this.update()
    commit('Common/stopLoading')
  }

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

  send(wallet: Wallet) {
    this.$router.push('/wallet/send')
  }

  receive(wallet: Wallet) {
    this.$router.push({
      path: '/wallet/receive'
    })
  }

  async update() {
    const { dispatch, commit } = this.$store
    dispatch('Wallet/updateWallet')
  }

  openTransaction(transaction: Transaction) {
    const { commit } = store
    commit.Wallet.setTransaction(transaction)
    this.$router.push('/wallet/transaction')
  }

  get expert() {
    const { state } = store
    return state.Common.Settings.mode === 'expert'
  }

  get transactions() {
    if (!this.wallet || !this.wallet.transactions) return []
    if (this.expert) return this.wallet.transactions
    return this.wallet.transactions.filter(
      (t) => t.type === 'send' || t.type === 'received'
    )
  }
}
</script>

<style lang="scss" scoped>
@import '~vuetify/src/styles/settings/colors';

.wallet-balance {
  &__amount {
    font-size: 3rem;
    margin-top: -0.5rem !important;
    line-height: 3.2rem;

    small {
      font-size: 60%;
      vertical-align: bottom;
    }
  }
}

.actions {
  display: flex;
  flex-direction: row;
  @media screen and (max-width: 960px) {
    .v-btn.v-size--large {
      padding: 0 16px;
    }
  }

  @media screen and (max-width: 600px) {
    .v-btn.v-size--large {
      padding: 0 12.5px;
    }
  }
}

.is--flipped {
  transform: scaleX(-1);
}
</style>
