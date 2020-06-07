<!-- @format -->

<template>
  <section v-if="ticket && lottery" class="ticket-detail" name="page-ticket">
    <portal to="topbar">
      <transition name="portal" mode="in-out">
        <header v-if="showPortal" class="ticket-detail__header">
          <div class="ticket-detail__header__label">
            Price Amount Won
            <span class="ticket-detail__header__label__perc">
              +{{ Math.round((ticket.amount / amountWon) * 100) | int | numberFormat }}%
            </span>
          </div>
          <div class="ticket-detail__header__price">
            {{ amountWon | numberFormat }}
            <span class="ticket-detail__header__price__addon">GRAM</span>
          </div>
        </header>
      </transition>
    </portal>

    <section class="ticket-detail__section">
      <div class="ticket-detail__section__key">
        Amount Invested
      </div>
      <div class="ticket-detail__section__val">
        {{ ticket.amount | numberFormat }} GRAM
      </div>
    </section>

    <section class="ticket-detail__section">
      <div class="ticket-detail__section__key">
        Ticket Id
      </div>
      <div class="ticket-detail__section__val" name="ticket-id">
        {{ ticket.id }}
      </div>
    </section>

    <section class="ticket-detail__section">
      <div class="ticket-detail__section__key">
        Wallet Id
      </div>
      <div class="ticket-detail__section__val">
        {{ ticket.walletId }}
      </div>
    </section>

    <section class="ticket-detail__section">
      <div class="ticket-detail__section__key">
        Lottery Id
      </div>
      <div class="ticket-detail__section__val">
        {{ ticket.lotteryId }}
      </div>
    </section>

    <section class="ticket-detail__section">
      <div class="ticket-detail__section__key">
        Time Purchased
      </div>
      <div class="ticket-detail__section__val">
        {{ ticket.purchaseTime | time }}
      </div>
    </section>

    <section v-if="lottery.timeEnded" class="ticket-detail__section">
      <div class="ticket-detail__section__key">
        Time Won
      </div>
      <div class="ticket-detail__section__val">
        {{ lottery.timeEnded | time }}
      </div>
    </section>

    <section class="ticket-detail__section">
      <div class="ticket-detail__section__key">
        Long String
      </div>
      <div class="ticket-detail__section__val">
        {{ ticket.longString }}
      </div>
    </section>

    <section class="ticket-detail__section">
      <div class="ticket-detail__section__key">
        Image
      </div>
      <img class="ticket-detail__section__img" :src="ticket.image" />
    </section>

    <section class="ticket-detail__section">
      <div class="ticket-detail__section__key">
        Image String
      </div>
      <div class="ticket-detail__section__val">
        {{ ticket.image }}
      </div>
    </section>

    <div v-if="false">
      <br />
      <br />DEBUG:
      <h1>Ticket:</h1>
      <pre v-text="ticket" />
      <h1>Lottery:</h1>
      <pre v-text="lottery" />
    </div>
  </section>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { Ticket as TicketModel } from '../models/ticket'
import { Lottery } from '../models/lottery'
import * as format from '@/common/lib/format'
import { mapState } from 'vuex'
import { RootState } from '@/common/store'

@Component({
  filters: {
    ...format
  },
  computed: {
    ...mapState<RootState>({
      ticket: ({ Lotton }) => Lotton.ticket,
      lottery: ({ Lotton }) => Lotton.lottery
    })
  }
})
export default class Ticket extends Vue {
  showPortal = true
  amountWon = 50000
  timeWon = new Date().toISOString()
  ticket!: TicketModel
  lottery!: Lottery

  async mounted() {
    const { commit, dispatch, state } = this.$store
    await dispatch('Lotton/getTicket', this.$route.params.id)
    if (this.ticket) {
      await dispatch('Lotton/getLottery', this.ticket.lotteryId)
    }
  }

  destroyed() {
    this.$store.commit('Lotton/setTicket', undefined)
  }
}
</script>

<style lang="scss">
@import '../styles/functions';

.ticket-detail {
  &__header {
    padding: rem(20);

    &__label {
      font-size: 1rem;
      color: var(--color-text);
      font-weight: 500;

      &__perc {
        border-radius: rem(8.5);
        font-size: rem(10);
        color: var(--color-text);
        background: var(--color-dark-3);
        height: rem(17);
        padding: rem(3) rem(7);
        font-weight: bolder;
        vertical-align: middle;
        margin-left: rem(4);
      }
    }

    &__price {
      color: var(--color-secondary);
      font-size: rem(64);
      font-weight: 500;
      margin-bottom: rem(-10);
      margin-top: rem(6);

      &__addon {
        font-size: rem(36);
        opacity: 0.4;
        margin-left: rem(-6);
      }
    }
  }

  &__section {
    border-bottom: 1px solid var(--color-border);
    padding: rem(15);

    &:first-of-type {
      margin-top: rem(10);
    }

    &__key {
      color: var(--color-text-dim-2);
      font-weight: 500;
      font-size: rem(14);
      margin-bottom: rem(7);
    }

    &__val {
      font-weight: 500;
      color: var(--color-text);
      font-size: rem(18);
      word-break: break-word;
    }

    &__img {
      border-radius: var(--radius);
      margin-top: rem(10);
      width: 100%;
      display: block;
      overflow: hidden;
    }
  }
}
</style>
