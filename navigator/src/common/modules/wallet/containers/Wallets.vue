<!-- @format -->

<template>
  <Page>
    <PageContent :width="500" :flex="walletsByParentKey.length < 1">
      <div v-if="walletsByParentKey.length < 1" class="box ma-auto">
        <div class="box__content">
          <div class="display-2 mb-4">
            TigerBee
          </div>

          <div class="symbol">
            🐯🐝
          </div>

          <div class="body-1 mt-2 slightly-transparent">
            Send coins<br />Easy and secure
          </div>
        </div>
      </div>

      <v-card v-for="group of walletsByParentKey" :key="group.id" class="mb-3">
        <v-subheader class="px-4">
          {{ group.key.name }}
          <v-spacer />

          <v-btn small text class="half-transparent" @click="importWallet(group.key.id)">
            <v-icon left class="mr-1"> arrow_downward </v-icon>Import
          </v-btn>

          <v-btn
            color="primary"
            class="mx-n2"
            text
            small
            @click="createWallet(group.key)"
          >
            <v-icon left class="mr-1"> add </v-icon>Wallet
          </v-btn>

          <v-menu bottom left max-width="100">
            <template v-slot:activator="{ on }">
              <v-btn icon class="half-transparent mr-n1 ml-2" small v-on="on">
                <v-icon>mdi-dots-vertical</v-icon>
              </v-btn>
            </template>

            <v-list>
              <v-list-item @click.stop="update">
                <v-list-item-title>Refresh Wallets</v-list-item-title>
              </v-list-item>
              <v-list-item @click="removeKey(group)">
                <v-list-item-title>Remove {{ group.name }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-subheader>

        <template v-if="group.wallets.length > 0">
          <WalletItem
            v-for="(wallet, i) of group.wallets"
            :key="i"
            :wallet="wallet"
            @open="open"
            @copy="copy"
            @remove="removeWallet"
          />
        </template>
        <template v-else>
          <v-divider />
          <div class="pa-4">
            <span class="half-transparent">No wallets in this key yet...</span>
          </div>
        </template>
      </v-card>
    </PageContent>

    <PageFooter :padding="true">
      <v-btn block large color="primary" @click="addKey">
        <v-icon left> add </v-icon>Key
      </v-btn>
    </PageFooter>
  </Page>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import Page from '@/common/components/Page.vue'
import PageFooter from '@/common/components/PageFooter.vue'
import PageContent from '@/common/components/PageContent.vue'
import { mapState, mapGetters } from 'vuex'
import { WalletState, Wallet, MasterKey } from '@/common/store/Wallet/Wallet'
import SwipeBtn from '@/common/components/SwipeBtn.vue'
import WalletItem from '@/common/modules/wallet/components/WalletItem.vue'
import store, { notify, RootState } from '@/common/store'
import { symbol } from '@/common/lib/constants'

interface WalletByKey {
  key: MasterKey
  wallets: Wallet[]
}

@Component({
  components: {
    Page,
    PageFooter,
    PageContent,
    SwipeBtn,
    WalletItem
  },
  computed: {
    ...mapState<RootState>({
      updating: ({ Wallet }) => Wallet.updatingAll
    }),
    ...mapGetters('Wallet', ['walletsByParentKey', 'walletsWithoutParentKey'])
  }
})
export default class WalletCreated extends Vue {
  walletsByParentKey!: WalletByKey[]
  walletsWithoutParentKey!: Wallet[]
  updating!: boolean
  symbol = symbol

  mounted() {
    const { commit } = store
    store.commit.Common.stopLoading()
    setTimeout(this.update, 500)
  }

  async update() {
    const { dispatch } = store
    await dispatch.Wallet.updateWallets()
  }

  async addKey() {
    const { commit, dispatch } = store
    const key = await dispatch.Wallet.getKey()
    commit.Wallet.addKey(key)
    commit.Wallet.setKey(key)
  }

  async importWallet(key: string) {
    this.$router.push({
      path: '/wallet/import',
      query: {
        key
      }
    })
  }

  async createWallet(key: MasterKey) {
    const { commit } = store
    commit.Wallet.setKey(key)
    this.$router.push('/wallet/created')
  }

  async removeWallet(wallet: Wallet) {
    const { dispatch } = store
    store.dispatch.Wallet.removeWallet(wallet)
  }

  async removeKey(group: WalletByKey) {
    const { dispatch } = store
    store.dispatch.Wallet.removeKey(group.key)
  }

  copy(value: string) {
    const { dispatch } = store
    store.dispatch.Common.copy(value).catch(() => console.warn("Couldn't copy"))
  }

  addWallet(key: MasterKey) {
    this.$router.push({
      path: '/wallet/create',
      query: {
        key: key.id
      }
    })
  }

  open(wallet: Wallet) {
    const { commit } = store
    store.commit.Wallet.setWallet(wallet)
    this.$router.push({
      path: '/wallet'
    })
  }
}
</script>

<style scoped lang="scss">
.box {
  /* position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%); */
  max-width: 350px;
  margin: auto;
  text-align: center;
}
.symbol {
  font-size: 18vw;

  @media screen and (min-width: 800px) {
    font-size: 8rem;
  }
}
</style>
