<!-- @format -->

<template>
  <Page>
    <PageContent :disabled="loading || disabled">
      <div class="box">
        <div class="box__content">
          <div class="title">
            Send and receive
          </div>
          <div class="symbol">
            {{ symbol }}
          </div>
          <div class="tagline">
            Easy and secure
          </div>
        </div>
      </div>
    </PageContent>

    <PageFooter :padding="true">
      <v-row dense>
        <v-col>
          <v-btn
            large
            block
            :loading="loading"
            :disabled="disabled"
            @click="importWallet"
          >
            Import
            <v-icon right>
              arrow_downward
            </v-icon>
          </v-btn>
        </v-col>
        <v-col>
          <v-btn
            block
            large
            :loading="loading"
            :disabled="disabled"
            color="primary"
            @click="create"
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
import { Component, Vue } from 'vue-property-decorator'
import Page from '@/common/components/Page.vue'
import PageFooter from '@/common/components/PageFooter.vue'
import PageContent from '@/common/components/PageContent.vue'
import { join } from 'path'
import { MasterKey } from '@/common/store/Wallet/Wallet'
import { addTimeoutToPromise } from '@/common/lib/error-handling'
import { mapState } from 'vuex'
import { symbol } from '@/common/lib/constants'
import { RootState } from '@/common/store'

@Component({
  components: {
    Page,
    PageFooter,
    PageContent
  },
  computed: {
    ...mapState<RootState>({
      loading: (state) => state.Common.Loading.loading,
      keystore: (state) => state.Wallet.keystore
    })
  }
})
export default class CreateWallet extends Vue {
  loading!: boolean
  disabled = false
  symbol = symbol
  keystore!: MasterKey[]

  beforeMount() {
    if (this.keystore && this.keystore.length > 0) return
    this.$router.push('/wallets').catch(() => null)
  }

  async mounted() {
    const { dispatch, commit } = this.$store
    commit('Common/stopLoading')
  }

  async importWallet() {
    const { id } = await this.getKey()
    this.$router.push({
      path: '/wallet/import',
      query: {
        key: id
      }
    })
  }

  async getKey() {
    const { dispatch, commit } = this.$store
    let key: MasterKey | undefined
    if (this.keystore.length < 1) {
      key = await dispatch('Wallet/getKey')
    } else {
      key = this.keystore.find((key) => key.id === this.$route.query.key)
    }
    if (!key) {
      throw new Error("Couldn't get Key")
    }
    return key
  }

  async create() {
    const { commit } = this.$store
    const key = await this.getKey()
    commit('Wallet/setKey', key)
    this.$router.push('/wallet/created')
  }
}
</script>

<style scoped lang="scss">
.box {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-width: 300px;
  text-align: center;
}
.symbol {
  font-size: 20vw;

  @media screen and (min-width: 800px) {
    font-size: 10rem;
  }
}
</style>
