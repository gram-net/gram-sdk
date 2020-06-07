<!-- @format -->

<template>
  <div>
    <v-list-item link name="nav-wallet" @click="$emit('open', wallet)">
      <v-list-item-avatar :class="{ avatar: !wallet }">
        <v-icon v-if="!wallet" size="22">
          account_balance_wallet
        </v-icon>
        <identicon v-else :seed="wallet.addressObj.baddr" />
      </v-list-item-avatar>
      <v-list-item-content v-if="wallet" class="py-4">
        <v-list-item-title name="profile-name">
          {{ wallet.name }}
        </v-list-item-title>
        <v-list-item-subtitle name="profile-email">
          {{ wallet.balance | gram(true, wallet.network.symbol) }}
        </v-list-item-subtitle>
      </v-list-item-content>
      <v-list-item-content v-else class="py-6">
        <v-list-item-title name="profile-name">
          No wallet available
        </v-list-item-title>
        <v-list-item-subtitle name="profile-email">
          Add your first Wallet
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
    <v-divider />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import Identicon from '@/common/modules/wallet/components/Identicon.vue'
import { Wallet } from '@/common/store/Wallet/Wallet'
import { gram } from '@/common/lib/format'

@Component({
  components: {
    Identicon
  },
  filters: {
    gram
  }
})
export default class WalletSummary extends Vue {
  @Prop() wallet!: Wallet
}
</script>

<style scoped lang="scss">
.avatar {
  border: 1px solid rgba(grey, 0.2);
}
</style>
