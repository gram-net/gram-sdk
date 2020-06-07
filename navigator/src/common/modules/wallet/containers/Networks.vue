<!-- @format -->

<template>
  <Page>
    <PageContent>
      <v-list class="list--clean">
        <template v-for="(network, i) of networks || []">
          <v-list-item :key="i">
            <v-list-item-content>
              <v-list-item-title class="mb-2">
                {{ network.name }}
                <v-chip v-if="!network.removable" class="ml-1" x-small>
                  Build-in
                </v-chip>
              </v-list-item-title>
              <v-list-item-subtitle>
                ID: {{ network.id }}
                <br />
                RPC URL: {{ network.RPCURL }}
                <br />
                Chain ID: {{ network.chainID }}
                <br />
                Symbol: {{ network.symbol }}
                <br />
                Block Explorer URL: {{ network.blockExplorerURL }}
                <br />
              </v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-action v-if="network.removable">
              <v-btn icon class="half-transparent" @click="removeNetwork(network)">
                <v-icon v-text="'delete'" />
              </v-btn>
            </v-list-item-action>
          </v-list-item>
          <v-divider v-if="i < networks.length - 1" :key="'d-' + i" class="mt-1 mb-2" />
        </template>
        <v-list-item v-if="networks.length < 1">
          No Networks Available
        </v-list-item>
      </v-list>
    </PageContent>

    <PageFooter :padding="true">
      <div class="text-center">
        <v-btn block large color="primary" @click="submit">
          <v-icon left> add </v-icon>Network
        </v-btn>
      </div>
    </PageFooter>
  </Page>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import Page from '@/common/components/Page.vue'
import PageFooter from '@/common/components/PageFooter.vue'
import PageContent from '@/common/components/PageContent.vue'
import { mapState, mapGetters } from 'vuex'
import { notify, RootState } from '@/common/store'
import { Network } from '@/common/models/network'

@Component({
  components: {
    Page,
    PageFooter,
    PageContent
  },
  computed: {
    ...mapState<RootState>({
      networks: (state) => state.Wallet.networks
    })
  }
})
export default class Networks extends Vue {
  networks!: Network[]

  mounted() {
    this.$store.commit('Common/stopLoading')
  }

  submit() {
    this.$router.push({
      query: {
        modal: 'network'
      }
    })
  }

  async removeNetwork(network: Network) {
    const { commit, dispatch, state } = this.$store
    const confirmed = await this.$confirm('Are you sure you want to remove this Network?')
    if (confirmed) {
      commit('Wallet/removeNetwork', network)
      notify({
        text: 'Removed ' + network.name,
        duration: 4000,
        type: 'info'
      })
    }
  }
}
</script>

<style scoped></style>
