<!-- @format -->

<template>
  <div @click="open">
    <v-divider />

    <v-list-item class="px-4 py-1" name="wallet-item" selectable ripple>
      <v-list-item-avatar class="avatar">
        <identicon :seed="wallet.addressObj.baddr" />
      </v-list-item-avatar>

      <v-list-item-content class="clickable" @click="select">
        <v-list-item-title name="wallet-item-name">
          {{ wallet.name }}
          <v-chip v-if="defaultWallet && wallet.name === defaultWallet.name" x-small>
            Default
          </v-chip>
        </v-list-item-title>
        <v-list-item-subtitle class="mt-1" name="wallet-item-addr">
          {{ wallet.balance | gram(true, wallet.network.symbol) }}
        </v-list-item-subtitle>
      </v-list-item-content>

      <v-list-item-action>
        <v-btn
          icon
          class="half-transparent mr-n4"
          name="wallet-item-delete"
          @click.stop="copy(wallet.addressObj.baddr)"
        >
          <v-icon small>
            file_copy
          </v-icon>
        </v-btn>
      </v-list-item-action>

      <v-list-item-action>
        <v-btn
          icon
          class="half-transparent"
          name="wallet-item-delete"
          small
          @click.stop="remove"
        >
          <v-icon small>
            delete
          </v-icon>
        </v-btn>
      </v-list-item-action>
    </v-list-item>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Emit, Watch, Prop } from 'vue-property-decorator'
import { gram, time } from '@/common/lib/format'
import { Wallet } from '@/common/store/Wallet/Wallet'
import Identicon from '@/common/modules/wallet/components/Identicon.vue'

@Component({
  filters: {
    gram,
    time
  },
  components: {
    Identicon
  }
})
export default class WalletItem extends Vue {
  @Prop() wallet!: Wallet
  @Prop() defaultWallet!: Wallet
  qr = ''

  mounted() {
    this.getQR()
  }

  @Watch('wallet')
  getQR() {
    const { dispatch } = this.$store
    if (!this.wallet) {
      this.qr = ''
      return
    }
    dispatch('Common/getQR', this.wallet.addressObj.baddr)
      .then((qr) => {
        this.qr = qr
      })
      .catch((error) =>
        dispatch('Common/Notifications/notify', {
          text: 'Error getting QR code',
          type: 'error',
          duration: 1500,
          payload: { error }
        })
      )
  }

  copy(str: string) {
    this.$emit('copy', str)
  }

  open() {
    this.$emit('open', this.wallet)
  }

  remove() {
    this.$emit('remove', this.wallet)
  }

  select() {
    this.$emit('select', this.wallet)
  }
}
</script>

<style scoped lang="scss"></style>
