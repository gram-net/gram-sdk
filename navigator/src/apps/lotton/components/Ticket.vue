<!-- @format -->

<template>
  <div v-if="ticket" class="ticket">
    <img v-if="thumb" class="ticket__thumb" :src="thumb" />

    <div class="ticket__details">
      <time :datetime="ticket.purchaseTime" class="ticket__details__time">{{
        ticket.purchaseTime | time
      }}</time>
      <div class="ticket__details__wallet" v-text="ticket.walletId" />
      <div class="ticket__details__amount">{{ ticket.amount | numberFormat }} GRAM</div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { Ticket as TicketModel } from '../models/ticket'
import { downsampleBase64 } from '@/common/lib/get-base64'
import * as format from '@/common/lib/format'

@Component({
  filters: {
    ...format
  }
})
export default class Ticket extends Vue {
  @Prop({ type: Object, default: null }) ticket!: TicketModel
  thumb = ''

  mounted() {
    if (this.ticket && this.ticket.image) {
      downsampleBase64(this.ticket.image, 100, 100).then(
        (t) => (this.thumb = t as string)
      )
    }
  }
}
</script>

<style lang="scss">
@import '../styles/functions';

.ticket {
  display: flex;
  color: var(--color-text-dim-2);
  text-decoration: none;
  font-size: rem(13);
  justify-content: space-between;
  border-bottom: 1px solid var(--color-border);
  transition: 0.15s ease-in-out;
  padding: rem(12) rem(15);

  &:hover {
    background: rgba(black, 0.15);
  }

  &__thumb {
    width: rem(40);
    height: rem(40);
    border-radius: var(--radius);
    overflow: hidden;
    object-fit: cover;
  }

  &__details {
    display: flex;
    flex-wrap: wrap;
    width: calc(100% - 3.1rem);

    &__time {
      font-size: rem(12);
      width: calc(100% - 6.25rem);
      margin-top: rem(2);
    }

    &__wallet {
      color: var(--color-text);
      width: calc(100% - 6.25rem);
      margin-top: rem(4);
      font-size: rem(14);
      font-weight: 500;
    }

    &__amount {
      color: white;
      width: rem(100);
      margin-left: auto;
      margin-top: auto;
      text-align: right;
      font-weight: 500;
      margin-bottom: auto;
    }
  }
}
</style>
