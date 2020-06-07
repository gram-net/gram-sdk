<!-- @format -->

<template>
  <Page>
    <PageHeader
      class="text-center"
      :color="
        transaction.type === 'received'
          ? 'success'
          : transaction.type === 'send'
          ? 'primary'
          : 'accent'
      "
    >
      <v-avatar class="avatar mt-2" size="55">
        <v-icon v-if="transaction.type === 'send'" v-text="'send'" />
        <v-icon
          v-if="transaction.type === 'received'"
          class="is--flipped"
          v-text="'send'"
        />
        <v-icon v-if="transaction.type === 'incoming'" v-text="'call_received'" />
        <v-icon v-if="transaction.type === 'outgoing'" v-text="'call_made'" />
      </v-avatar>

      <div class="text-center subtitle-1 my-1 mb-n1 white--text slightly-transparent">
        {{ transaction.type }}
      </div>

      <v-list v-if="transaction.value" two-line subheader class="list--clean mb-n5">
        <v-list-item>
          <v-list-item-content class="wallet-balance">
            <v-list-item-title class="mt-2 wallet-balance__amount">
              {{ transaction.type === 'received' ? '+' : ''
              }}{{ transaction.value | gram(true, '') }}
              <small class="mt-n1">{{ wallet.network.symbol }}</small>
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </PageHeader>

    <PageContent>
      <v-list v-if="transaction" class="list--clean">
        <template v-if="transaction.type === 'send' || transaction.type === 'received'">
          <v-list-item>
            <v-list-item-content class="overflow-initial">
              <v-list-item-subtitle class="d-flex align-center overflow-initial">
                <span v-text="transaction.type === 'send' ? 'To' : 'From'" />
                <v-spacer />
                <v-btn
                  small
                  text
                  class="mr-n3 half-transparent"
                  @click="
                    sendTo(
                      transaction.type ? transaction.source : transaction.destination
                    )
                  "
                >
                  Send <v-icon x-small class="ml-1" v-text="'send'" />
                </v-btn>
              </v-list-item-subtitle>
              <v-text-field
                readonly
                append-icon="file_copy"
                solo
                class="has--copy mb-n7 mt-2"
                label="Address"
                :value="transaction.type ? transaction.source : transaction.destination"
                @click:append="
                  copy(transaction.type ? transaction.source : transaction.destination)
                "
              />
            </v-list-item-content>
          </v-list-item>
          <v-divider class="my-1" />
        </template>

        <v-list-item>
          <v-list-item-content>
            <v-list-item-subtitle v-text="'Time'" />
            <v-list-item-title class="mt-2">
              {{ (transaction.time * 1000) | time }}
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-divider class="my-1" />

        <v-list-item>
          <v-list-item-content>
            <v-list-item-subtitle v-text="'Transaction ID'" />
            <v-text-field
              readonly
              append-icon="file_copy"
              solo
              class="has--copy mb-n7 mt-2"
              label="Address"
              :value="transaction.hash"
              @click:append="copy(transaction.hash)"
            />
          </v-list-item-content>
        </v-list-item>
        <v-divider class="my-1" />

        <v-list-item>
          <v-list-item-content>
            <v-list-item-subtitle v-text="'Network'" />
            <v-list-item-title class="mt-2">
              {{ wallet.network.name }}
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-divider class="my-1" />
        <template v-if="expert">
          <v-list-item>
            <v-list-item-content>
              <v-list-item-subtitle
                class="clickable"
                @click="panels.message = !panels.message"
                v-text="'Message'"
              />
            </v-list-item-content>

            <v-list-item-action class="text-center mb-auto mt-2">
              <v-btn icon class="slightly-transparent" @click="togglePanel('message')">
                <v-icon v-text="'keyboard_arrow_down'" />
              </v-btn>
            </v-list-item-action>
          </v-list-item>
          <v-expand-transition>
            <v-card v-show="panels.message" class="mt-0 mb-4">
              <v-card-text>
                <pre>{{ transaction.message }}</pre>
              </v-card-text>
            </v-card>
          </v-expand-transition>
          <v-divider class="my-1" />

          <v-list-item>
            <v-list-item-content>
              <v-list-item-subtitle
                class="clickable"
                @click="panels.transaction = !panels.transaction"
                v-text="'Transaction'"
              />
            </v-list-item-content>

            <v-list-item-action class="text-center mb-auto mt-2">
              <v-btn
                icon
                class="slightly-transparent"
                @click="togglePanel('transaction')"
              >
                <v-icon v-text="'keyboard_arrow_down'" />
              </v-btn>
            </v-list-item-action>
          </v-list-item>
          <v-expand-transition>
            <v-card v-show="panels.transaction" class="mt-0 mb-4">
              <v-card-text>
                <pre>{{ transaction.transaction }}</pre>
              </v-card-text>
            </v-card>
          </v-expand-transition>
          <v-divider class="my-1" />

          <v-list-item>
            <v-list-item-content>
              <v-list-item-subtitle
                class="clickable"
                @click="panels.block = !panels.block"
                v-text="'Block'"
              />
            </v-list-item-content>

            <v-list-item-action class="text-center mb-auto mt-2">
              <v-btn icon class="slightly-transparent" @click="togglePanel('block')">
                <v-icon v-text="'keyboard_arrow_down'" />
              </v-btn>
            </v-list-item-action>
          </v-list-item>
          <v-expand-transition>
            <v-card v-show="panels.block" class="mt-0 mb-4">
              <v-card-text>
                <pre>{{ transaction.block }}</pre>
              </v-card-text>
            </v-card>
          </v-expand-transition>
          <v-divider class="my-1" />
        </template>
      </v-list>
    </PageContent>

    <PageFooter :padding="true">
      <v-btn color="primary" large block name="wallet-receive" @click="explore">
        Explore
        <v-icon right v-text="'explore'" />
      </v-btn>
    </PageFooter>
  </Page>
</template>

<script lang="ts">
import { Component, Vue, Emit, Watch } from 'vue-property-decorator'
import Page from '@/common/components/Page.vue'
import PageContent from '@/common/components/PageContent.vue'
import PageFooter from '@/common/components/PageFooter.vue'
import PageHeader from '@/common/components/PageHeader.vue'
import store, { notify } from '@/common/store'
import { Transaction as TransactionModel } from '@gram-net/wasm/dist/models/transaction'
import { gram, time } from '@/common/lib/format'
import { Wallet, PendingTransaction } from '@/common/store/Wallet/Wallet'
import { symbol } from '@/common/lib/constants'
import { Network } from '../../../models/network'

@Component({
  filters: {
    gram,
    time
  },
  components: {
    Page,
    PageContent,
    PageFooter,
    PageHeader
  }
})
export default class Transaction extends Vue {
  symbol = symbol

  panels = {
    message: false,
    transaction: false,
    block: false
  }

  get transaction() {
    const { state } = store
    return state.Wallet.transaction as TransactionModel
  }

  get wallet() {
    const { getters } = store
    return getters.Wallet.wallet as Wallet
  }

  mounted() {
    const { commit } = store
    commit.Common.stopLoading()
  }

  beforeRouteLeave(to, from, next) {
    const { commit } = store
    commit.Wallet.setTransaction(null)
  }

  copy(str: string) {
    const { dispatch } = store
    dispatch.Common.copy(str)
  }

  togglePanel(key: string) {
    this.panels[key] = !this.panels[key]
  }

  get expert() {
    const { state } = store
    return state.Common.Settings.mode === 'expert'
  }

  explore() {
    const url = (this.wallet.network as Network).blockExplorerURL

    window.open(url, '_blank')
  }

  sendTo(addr: string) {
    const { commit } = store
    commit.Wallet.setPendingTransaction({
      amount: null,
      fromAddr: this.wallet.addressObj.baddr,
      toAddr: addr
    } as PendingTransaction)
    this.$router.push('/wallet/send')
  }

  submit() {
    notify({
      text: 'Submitting works!',
      type: 'success',
      duration: Infinity,
      payload: {
        foo: 'bar'
      }
    })
  }
}
</script>

<style scoped lang="scss">
pre {
  overflow: auto;
}

.avatar {
  border: 1px solid rgba(white, 0.3);
}

.wallet-balance {
  &__amount {
    font-size: 3rem;
    margin-top: -0.5rem !important;

    small {
      font-size: 60%;
      vertical-align: bottom;
      display: inline-block;
      vertical-align: middle;
    }
  }
}

.is--flipped {
  transform: scaleX(-1);
}
</style>
