<!-- @format -->

<template>
  <Page>
    <PageContent :disabled="loading || sending" :width="500">
      <div>
        <v-list v-if="pendingTransaction" class="list--clean">
          <v-list-item>
            <v-list-item-content>
              <v-list-item-subtitle v-text="'Amount'" />
              <v-list-item-title class="mt-1">
                {{ pendingTransaction.amount | gram(true, wallet.network.symbol) }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-divider v-if="pendingTransaction" class="my-1" />

          <v-list-item>
            <v-list-item-content>
              <v-list-item-subtitle v-text="'Recipient Address'" />
              <v-list-item-title class="mt-2">
                {{ pendingTransaction.toAddr }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-divider class="my-1" />

          <v-list-item v-if="pendingTransaction.comment">
            <v-list-item-content>
              <v-list-item-subtitle v-text="'Comment'" />
              <v-list-item-title class="mt-2">
                {{ pendingTransaction.comment }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-divider v-if="pendingTransaction.comment" class="my-1" />

          <v-list-item class="pl-0 pr-0">
            <v-list-item-content>
              <v-list-item-subtitle v-text="'Fee (estimate)'" />
            </v-list-item-content>
            <v-list-item-action>
              <v-list-item-action-text class="text-right">
                {{ fee | gram(true, wallet.network.symbol) }}
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
                {{ total | gram(true, wallet.network.symbol) }}
              </v-list-item-action-text>
            </v-list-item-action>
          </v-list-item>
        </v-list>
      </div>
    </PageContent>

    <PageFooter :padding="true">
      <SwipeBtn
        :loading-text="sending ? 'Sending...' : 'Loading...'"
        :initial-text="`Swipe to send ${gram(
          !pendingTransaction ? 0 : pendingTransaction.amount,
          true,
          wallet.network.symbol
        )}`"
        :loading="loading || sending"
        @confirm="submit"
      />
    </PageFooter>
  </Page>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import Page from '@/common/components/Page.vue'
import PageFooter from '@/common/components/PageFooter.vue'
import PageContent from '@/common/components/PageContent.vue'
import { mapState } from 'vuex'
import { WalletState, PendingTransaction } from '@/common/store/Wallet/Wallet'
import SwipeBtn from '@/common/components/SwipeBtn.vue'
import { LoadingState } from '@/common/store/Common/Loading'
import { gram } from '@/common/lib/format'
import {
  handleTimeout,
  handleError,
  addTimeoutToPromise
} from '@/common/lib/error-handling'
import { fee, symbol, nanoFactor, sendTimeout } from '@/common/lib/constants'
import store, { RootState, notify } from '@/common/store'
import { Wallet } from '../../../../apps/lotton/models/wallet'

@Component({
  components: {
    Page,
    PageFooter,
    PageContent,
    SwipeBtn
  },
  filters: {
    gram
  },
  computed: {
    ...mapState<RootState>({
      loading: ({ Common }) => Common.Loading.loading,
      pendingTransaction: ({ Wallet }) => Wallet.pendingTransaction,
      sending: ({ Wallet }) => Wallet.sending
    })
  }
})
export default class Receipt extends Vue {
  loading!: boolean
  pendingTransaction!: PendingTransaction
  feePerc = fee
  sending!: boolean
  gram = gram

  beforeMount() {
    if (!this.pendingTransaction) this.$router.push('/wallet/send')
  }

  mounted() {
    const { commit } = store
    commit.Common.stopLoading()
  }

  get wallet() {
    return store.getters.Wallet.wallet as Wallet
  }

  get fee() {
    return fee * nanoFactor
  }

  get total() {
    return +(this.pendingTransaction.amount || 0) + this.fee
  }

  async submit() {
    const { dispatch, commit, state } = store
    const receiverIsMe = state.Wallet.wallets.find(
      (w) => w.addressObj.baddr === this.pendingTransaction.toAddr
    )

    if (!this.pendingTransaction) return
    try {
      await addTimeoutToPromise(dispatch.Wallet.send(), sendTimeout)
      commit.Wallet.setPendingTransaction(null)
      this.$router.push('/wallet')
      if (receiverIsMe) {
        setTimeout(() => dispatch.Wallet.updateWallet(receiverIsMe.id), 3000)
      }
    } catch (error) {
      handleError(error, `Sending timed out`)
    }
  }
}
</script>

<style scoped>
.v-list {
  background: none;
}

.footer {
  background: rgba(0, 0, 0, 0.3);
}

.page__footer .swipe-btn {
  width: 100%;
  min-width: 200px;
  max-width: 350px;
  margin: auto;
}
</style>
