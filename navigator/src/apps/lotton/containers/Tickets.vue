<!-- @format -->

<template>
  <div name="page-tickets">
    <portal to="topbar">
      <transition name="portal" mode="in-out">
        <div v-if="showPortal">
          <div
            class="ticket-form"
            name="form"
            :data-last-ticket-id="lastPurchased && lastPurchased.id"
          >
            <h2 v-if="showValidation && validation.amount" class="group-label">
              <span class="group-label__msg">{{ validation.amount }}</span>
            </h2>

            <TextField
              v-model="form.amount"
              label="Bet amount"
              name="form-amount"
              type="number"
              addon="GRAM"
              @blur="touch"
            />

            <div name="form-wallet" @click.stop="walletDialogOpen = true">
              <TextField
                v-if="wallet"
                v-model="wallet.name"
                label="Wallet"
                :dropdown="true"
                :addon="wallet.balance | abbrNumber | uppercase | suffix(' GRAM')"
                @blur="touch"
              />
            </div>

            <Dialog
              :open="walletDialogOpen"
              title="Select Wallet"
              name="form-wallet-dialog"
              @close="walletDialogOpen = false"
            >
              <button
                v-for="wallet of account"
                :key="wallet.id"
                class="dialog-item"
                :name="'form-wallet-dialog-' + wallet.id"
                @click="
                  walletModel = wallet.id
                  walletDialogOpen = false
                "
              >
                {{ wallet.name }}
                <span class="dialog-item__addon"
                  >{{ wallet.balance | numberFormat }} GRAM</span
                >
              </button>
            </Dialog>

            <h2 class="group-label">
              Long String
              <span
                v-if="showValidation && validation.longString"
                class="group-label__msg"
                >{{ validation.longString }}</span
              >
            </h2>

            <textarea
              v-model="form.longString"
              label="Long String"
              class="textarea"
              name="form-long-string"
              placeholder="Enter a string between 255 and 1024 characters long"
              @blur="touch"
            />

            <h2 v-if="showValidation && validation.image" class="group-label">
              <span class="group-label__msg">{{ validation.image }}</span>
            </h2>

            <div class="img-file">
              <img
                v-if="form.preview"
                :src="form.preview"
                name="form-wallet-thumb"
                class="img-file__img"
              />

              <input
                ref="file"
                class="img-file__input"
                type="file"
                accept="image/gif, image/jpeg, image/png"
                name="form-wallet-image"
                @change="fileChange"
              />

              <div class="img-file__btn">
                <button class="btn type--ghost" @click="$refs.file.click()" @blur="touch">
                  <img :src="require('@/apps/lotton/assets/icon-camera.svg')" />
                  &nbsp; Take a Photo
                </button>
              </div>
            </div>
          </div>

          <div v-if="false">
            <pre>{{ form }}</pre>
            Wallet:
            <pre>{{ wallet }}</pre>
            show validation: {{ showValidation }}
            <pre v-if="showValidation">{{ validation }}</pre>
            <button class="btn" @click="resetForm">
              Reset
            </button>
          </div>

          <button class="btn" name="form-submit" @click="buy">
            Buy Ticket
          </button>
        </div>
      </transition>
    </portal>

    <h1 class="page-title">
      Sold Tickets
    </h1>

    <router-link
      v-for="ticket of tickets"
      :key="ticket.id"
      :name="'sold-ticket-' + ticket.id"
      :to="`tickets/${ticket.id}`"
    >
      <Ticket :ticket="ticket" />
    </router-link>
  </div>
</template>

<script lang="ts">
import { Watch, Component, Vue } from 'vue-property-decorator'
import TextField from '../components/TextField.vue'
import Ticket from '../components/Ticket.vue'
import Dialog from '../components/Dialog.vue'
import { getBase64, downsampleBase64 } from '@/common/lib/get-base64'
import { Wallet } from './../models/wallet'
import { makeid } from '@/common/lib/makeid'
import { Ticket as TicketModel } from '../models/ticket'
import isEqual from 'lodash/isEqual'
import * as format from '@/common/lib/format'
import { mapState } from 'vuex'
import { Lottery } from '../models/lottery'
import { RootState } from '@/common/store'

interface Form {
  amount: number
  image: string
  longString: string
  touched: boolean
  preview: string
}

@Component({
  filters: {
    ...format
  },
  components: {
    TextField,
    Ticket,
    Dialog
  },
  computed: {
    ...mapState<RootState>({
      account: ({ Lotton }) => Lotton.account,
      lottery: ({ Lotton }) => Lotton.lottery,
      wallet: ({ Lotton }) => Lotton.wallet
    })
  }
})
export default class Tickets extends Vue {
  defaultForm: Form = {
    amount: 0,
    image: '',
    longString: '',
    touched: false,
    preview: ''
  }
  form: Form = { ...this.defaultForm }
  showPortal = false
  walletDialogOpen = false
  wallet!: Wallet
  account!: Account
  lottery!: Lottery
  lastPurchased: TicketModel | null = null

  async mounted() {
    const { state, commit, dispatch } = this.$store
    await dispatch('Lotton/getLottery', 'test1')
    this.resetForm()
    this.showPortal = true
  }

  destroyed() {
    this.resetForm()
    this.showPortal = false
    this.walletDialogOpen = false
  }

  touch() {
    this.form.touched = true
  }

  get walletModel() {
    return (this.wallet || {}).id
  }

  set walletModel(id: string) {
    this.touch()
    this.$store.commit('Lotton/setWallet', id)
  }

  get showValidation(): boolean {
    return this.form.touched && Object.values(this.validation).length > 0
  }

  get tickets(): TicketModel[] {
    if (this.lottery && this.lottery.soldTickets) {
      return this.lottery.soldTickets
    } else return []
  }

  newTicket(): TicketModel {
    const ticket = {
      id: makeid(),
      amount: this.form.amount,
      walletId: this.wallet.id,
      purchaseTime: new Date().toISOString(),
      longString: this.form.longString,
      image: this.form.image,
      lotteryId: this.lottery.id
    }
    this.lastPurchased = ticket
    return ticket
  }

  async buy() {
    this.touch()
    if (!this.showValidation) {
      await this.$store.dispatch('Lotton/buyTicket', this.newTicket())
      this.resetForm()
    }
  }

  resetForm() {
    this.form = { ...this.defaultForm }
  }

  get validation() {
    let error: { [name: string]: string } = {}
    if (!this.form.amount) error.amount = 'Amount is required'
    if (!this.form.image) error.image = 'Image is required'
    if (!this.wallet) error.wallet = 'Wallet is required'
    if (this.form.longString.length < 255)
      error.longString = 'Long string minimum 255 characters'
    if (this.form.longString.length > 1024)
      error.longString = 'Long string maximum 1024 characters'
    if (!this.form.longString) error.longString = 'Long string is required'
    return error
  }

  fileChange(e: any) {
    if (e.target.files && e.target.files[0]) {
      ;(async () => {
        this.form.image = (await getBase64(e.target.files[0])) as string
        this.touch()
        downsampleBase64(this.form.image, 100, 100).then(
          (str) => (this.form.preview = str as string)
        )
      })()
    }
  }
}
</script>

<style lang="scss">
@import '../styles/functions';

.portal-enter-active,
.portal-leave-active {
  transition: max-height 1s, opacity 1s;
  max-height: rem(650);
  overflow: hidden;
  opacity: 1;
}
.portal-enter,
.portal-leave-to {
  opacity: 0;
  max-height: 0;
  overflow: hidden;
}

.img-file {
  display: flex;
  width: 100%;

  &__input {
    display: none;
  }

  &__btn {
    width: 100%;
  }

  &__img {
    border-radius: var(--radius);
    height: rem(40);
    width: rem(40);
    overflow: hidden;
    display: inline-block;
    margin-right: rem(7);
  }
}

.ticket-form {
  padding: rem(15);

  .input-group,
  .textarea {
    margin-bottom: rem(10);
  }

  .group-label {
    margin-top: rem(15);
    margin-bottom: rem(9);
  }
}

.page-title {
  font-size: rem(18);
  margin: rem(27) rem(20) rem(13);
  font-weight: 500;
  color: var(--color-text);
}
</style>
