<!-- @format -->

<template>
  <Page>
    <PageContent>
      <div class="phrase-container">
        <v-tabs-items v-model="tab">
          <v-tab-item>
            <div class="mb-7 mt-3 text-center slightly-transparent">
              Write down this 12-word phrase and store it in a safe place. You can use
              this phrase to retrieve your wallet in case you lose access.
            </div>

            <v-chip
              v-for="(word, i) of wordsFromLength"
              :key="'r-' + i + word"
              large
              class="phrase-chip unclickable"
            >
              {{ word }}
              <span class="half-transparent ml-1">{{ i + 1 }}</span>
            </v-chip>
          </v-tab-item>

          <v-tab-item>
            <div class="mb-7 mt-3 text-center slightly-transparent">
              Select the words in the order that you wrote them down
            </div>

            <v-chip
              v-for="(word, i) of randomWords"
              :key="'r-' + i + word"
              large
              :color="confirmedWords.includes(word) ? 'primary' : null"
              class="phrase-chip"
              @click="confirmedWords.includes(word) ? remove(word) : confirmWord(word)"
            >
              {{ word }}
            </v-chip>

            <div v-if="confirmedWords.length">
              <v-divider class="my-5" />
              <v-chip
                v-for="(word, i) of confirmedWords"
                :key="'r-' + i + word"
                large
                class="phrase-chip half-transparent"
              >
                {{ word }}
                <span class="half-transparent ml-1">{{ i + 1 }}</span>
              </v-chip>
            </div>
          </v-tab-item>
        </v-tabs-items>
      </div>
    </PageContent>

    <PageFooter :padding="true" class="text-center">
      <v-tabs-items v-model="tab">
        <v-btn v-if="tab === 0" large block color="primary" @click="next">
          Continue
        </v-btn>

        <div v-else>
          <v-btn class="mb-3" text :disabled="forging || loading" @click="skip">
            Skip
          </v-btn>
          <v-btn
            block
            large
            :loading="loading || forging"
            color="primary"
            @click="submit"
          >
            Verify
          </v-btn>
        </div>
      </v-tabs-items>
    </PageFooter>
  </Page>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import Page from '@/common/components/Page.vue'
import PageFooter from '@/common/components/PageFooter.vue'
import PageContent from '@/common/components/PageContent.vue'
import { mapState } from 'vuex'
import {
  WalletState,
  MasterKey,
  CreateWalletOptions,
  Wallet
} from '@/common/store/Wallet/Wallet'
import {
  addTimeoutToPromise,
  handleTimeout,
  handleError
} from '@/common/lib/error-handling'
import SwipeBtn from '@/common/components/SwipeBtn.vue'
import { randomArray } from '@/common/lib/random-array'
import store, { RootState, notify } from '@/common/store'
import { pause } from '../../../lib/helpers'
import { decrypt } from '../../../lib/crypto'

@Component({
  components: {
    Page,
    PageFooter,
    PageContent,
    SwipeBtn
  },
  computed: {
    ...mapState<RootState>({
      loading: ({ Common }) => Common.Loading.loading,
      keystore: ({ Wallet }) => Wallet.keystore,
      key: ({ Wallet }) => Wallet.key,
      forging: ({ Wallet }) => Wallet.forging,
      words: ({ Wallet }) => (Wallet.key ? Wallet.key.mnemonic : '' || '').split(' ')
    })
  }
})
export default class ConfirmWallet extends Vue {
  randomWords: string[] = []
  confirmedWords: string[] = []
  forging!: boolean
  words!: string[]
  keystore!: MasterKey[]
  key!: MasterKey
  phrase = 12
  tab = 0

  get mnemonic() {
    const { key } = store.state.Wallet
    const encrypted = key ? key.mnemonic : ''
    const decrypted = decrypt(encrypted, store.state.Common.Login.pin as string)
    return decrypted
  }

  beforeMount() {
    if (this.wordsFromLength && this.wordsFromLength.length > 0) return
    this.$router.push({
      path: '/wallet/create'
    })
  }

  get wallet() {
    return store.getters.Wallet.wallet as Wallet
  }

  get wordsFromLength() {
    if (this.mnemonic) {
      return this.mnemonic
        .split(' ')
        .filter((w) => !!w)
        .map((w) => w.trim())
    } else return []
  }

  mounted() {
    this.$store.commit('Common/stopLoading')
    this.getRandomWords()
    if (this.$route.query.phrase) {
      this.phrase = +this.$route.query.phrase
    }
  }

  async submit() {
    const { dispatch, commit, state } = store
    const { key, valid } = this

    if (valid) {
      // animate warning

      const redirect = this.$route.query.redirect as string | undefined
      commit.Wallet.patchWallet({
        id: this.wallet.id,
        update: { backedUp: true }
      })
      await this.$router.push(redirect || '/wallet')

      notify({
        text: `Successfuly backup up ${this.wallet.name}`,
        type: 'success',
        duration: 2000
      })
    } else {
      notify({
        text:
          "The words don't match with the words we thought you wrote down. Please try again",
        duration: 6000
      })

      this.getRandomWords()
      this.confirmedWords = []
    }
  }

  skip() {
    this.confirmedWords = [...this.wordsFromLength]
    this.submit()
  }

  get valid() {
    const c = JSON.stringify(this.confirmedWords)
    const w = JSON.stringify(this.wordsFromLength)
    return c && w && c === w
  }

  @Watch('wordsFromLength')
  getRandomWords() {
    this.randomWords = randomArray(this.wordsFromLength)
  }

  remove(word: string) {
    this.confirmedWords = this.confirmedWords.filter((w) => w !== word)
  }

  get randomWordsFiltered() {
    return this.randomWords.filter((w) => !this.confirmedWords.includes(w))
  }

  confirmWord(word: string) {
    this.confirmedWords = [...this.confirmedWords, word]
  }

  async next() {
    const yes = await this.$confirm('Have you written down the 12-word phrase?', {
      color: 'info',
      icon: '',
      title: 'Continue'
    })
    if (yes) this.tab++
  }
}
</script>

<style scoped>
.v-tabs-items {
  background: none !important;
}
.v-window-item {
  padding: 0;
}
</style>
