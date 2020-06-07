<!-- @format -->

<template>
  <div>
    <v-list-item class="clickable py-1" ripple>
      <v-list-item-avatar :title="transaction.type" class="avatar">
        <v-icon v-if="transaction.type === 'send'" color="primary" v-text="'send'" />
        <v-icon
          v-if="transaction.type === 'received'"
          class="is--flipped"
          color="success"
          v-text="'send'"
        />
        <v-icon
          v-if="transaction.type === 'incoming'"
          color="accent"
          v-text="'call_received'"
        />
        <v-icon
          v-if="transaction.type === 'outgoing'"
          color="accent"
          v-text="'call_made'"
        />
      </v-list-item-avatar>

      <v-list-item-content>
        <v-list-item-title>
          <v-row class="ma-0">
            <span class="half-transparent caption">
              <span>{{ (transaction.time * 1000) | time('MMM DD') }}</span> -
              <span v-if="transaction.type === 'received'">received from:</span>
              <span v-if="transaction.type === 'send'">send to:</span>
              <span v-if="transaction.type === 'incoming'">incoming message:</span>
              <span v-if="transaction.type === 'outgoing'">outgoing message:</span>
            </span>

            <v-spacer />

            <span v-if="transaction.type === 'received'" class="success--text"
              >+{{ transaction.value | gram(true, symbol) }}</span
            >
            <span v-if="transaction.type === 'send'">{{
              transaction.value | gram(true, symbol)
            }}</span>
          </v-row>
        </v-list-item-title>
        <v-list-item-subtitle class="subtitle-1">
          <span v-if="transaction.type === 'send'">{{ transaction.destination }}</span>
          <span v-if="transaction.type === 'received'">{{ transaction.source }}</span>
          <span v-if="transaction.type === 'outgoing'">{{ transaction.message }}</span>
          <span v-if="transaction.type === 'incoming'">{{ transaction.message }}</span>
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
    <v-divider />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Emit, Watch, Prop } from 'vue-property-decorator'
import { Transaction as TransactionModel } from '@gram-net/wasm/dist/models/transaction'
import { gram, time } from '@/common/lib/format'
import { themeColors } from '@/vuetify'

@Component({
  filters: {
    gram,
    time
  }
})
export default class Transaction extends Vue {
  @Prop() transaction!: TransactionModel
  @Prop({ default: '' }) symbol!: string
  colors = themeColors
  // mounted() {}
}
</script>

<style scoped lang="scss">
.avatar {
  border: 1px solid rgba(white, 0.15);

  .v-application.theme--light & {
    border: 1px solid rgba(black, 0.1);
  }

  .v-icon {
    transform: scale(0.7);
    &.is--flipped {
      transform: scale(0.7) scaleX(-1);
    }
  }
}
</style>
