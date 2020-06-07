<!-- @format -->

<template>
  <Page>
    <PageHeader :disabled="forging">
      <v-text-field
        ref="name"
        v-model="form.name"
        class="type--large mb-n7"
        label="Wallet name"
        single-line
        light
        :loading="forging"
        :disabled="forging"
        height="4rem"
        solo
        @keydown.enter="submit"
      />
    </PageHeader>
    <PageContent :disabled="forging">
      <v-list class="pt-0">
        <v-subheader>
          Select Network
          <v-spacer />
          <v-btn
            text
            small
            class="half-transparent mr-n2"
            @click="
              $router.push({
                query: { modal: 'network' }
              })
            "
          >
            <v-icon left class="mr-1"> add </v-icon>Network
          </v-btn>
        </v-subheader>

        <v-divider />
        <v-list-item-group v-model="networkModel" color="primary">
          <template v-for="(network, i) in networks">
            <v-list-item :key="i" class="px-4">
              <v-list-item-content>
                <v-list-item-title v-text="network.name" />
              </v-list-item-content>
            </v-list-item>
          </template>
        </v-list-item-group>
      </v-list>
    </PageContent>

    <PageFooter :padding="true">
      <v-btn block large color="primary" :loading="forging" @click="submit">
        Create
      </v-btn>
    </PageFooter>
  </Page>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import Page from '@/common/components/Page.vue'
import PageFooter from '@/common/components/PageFooter.vue'
import PageHeader from '@/common/components/PageHeader.vue'
import PageContent from '@/common/components/PageContent.vue'
import { mapState } from 'vuex'
import { MasterKey, getNextName } from '@/common/store/Wallet/Wallet'
import store, { RootState } from '@/common/store'
import { notify } from '@/common/store'
import { Network } from '@/common/models/network'
import { addTimeoutToPromise, handleError } from '@/common/lib/error-handling'
import { forgeTimeout } from '@/common/lib/constants'

@Component({
  components: {
    Page,
    PageFooter,
    PageHeader,
    PageContent
  },
  computed: {
    ...mapState<RootState>({
      key: (state) => state.Wallet.key,
      network: (state) => state.Wallet.network,
      networks: (state) => state.Wallet.networks,
      forging: (state) => state.Wallet.forging
    })
  }
})
export default class WalletCreated extends Vue {
  networks!: Network[]
  key!: MasterKey
  network!: Network | null
  selection = 0
  forging!: boolean

  form = {
    name: ''
  }

  get networkModel() {
    return this.selection
  }

  set networkModel(val: number) {
    const { commit } = store
    this.selection = val
    const network = this.networks[val]
    commit.Wallet.setNetwork(network)
  }

  async addNetwork() {
    this.$router.push({
      query: {
        modal: 'network'
      }
    })
  }

  mounted() {
    this.selection =
      (this.networks || []).findIndex((n) => this.network && this.network.id === n.id) ||
      0
    const { commit, state } = store
    this.form.name = getNextName(
      'Wallet',
      state.Wallet.wallets.map((w) => w.name)
    )
    setTimeout(() => {
      ;(this.$refs.name as any).focus()
    }, 500)
    store.commit.Common.stopLoading()
  }

  async submit() {
    const { dispatch, commit, state } = store

    const alert = (text: string) =>
      notify({
        text,
        type: 'error',
        duration: 2000
      })
    const exists = state.Wallet.wallets
      .map((w) => w.name)
      .find((n) => n === this.form.name)

    if (!this.network) {
      return alert('Please select a network')
    } else if (exists) {
      return alert('A wallet with this name already exists')
    }

    const { notification } = await notify({
      text: `Creating ${this.form.name || 'wallet'}. Hold on tight…`,
      type: 'info',
      duration: Infinity
    })

    try {
      await addTimeoutToPromise(
        dispatch.Wallet.forgeWallet({ key: this.key, name: this.form.name }),
        forgeTimeout
      )
    } catch (error) {
      handleError(error, error, 6000)
    } finally {
      commit.Wallet.setForging(false)
      notification.dismiss()
    }
  }
}
</script>

<style scoped></style>
