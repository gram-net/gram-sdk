<!-- @format -->

<template>
  <Page>
    <PageHeader :padding="false">
      <v-tabs
        v-model="tab"
        class="mt-6"
        :mobile-break-point="500"
        color="white"
        centered
        background-color="primary"
      >
        <v-tab v-for="item in items" :key="item.tab">
          {{ item.title }}
        </v-tab>
      </v-tabs>
    </PageHeader>
    <PageContent :disabled="allLoading" :width="500">
      <v-tabs-items v-model="tab" class="mt-n3">
        <v-tab-item key="One">
          <v-textarea
            ref="phrase"
            v-model="form.backup"
            auto-grow
            :disabled="allLoading"
            single-line
            rows="1"
            label="Secret phrase"
            hint="The 12-word phrase you wrote down"
          />
          <v-text-field
            v-model="form.path"
            :disabled="allLoading"
            single-line
            label="Derivation path (optional)"
            hint="Looks something like m/44/1337/0'"
          />
        </v-tab-item>
        <v-tab-item key="Two">
          <v-textarea
            ref="pk"
            v-model="form.key"
            :disabled="allLoading || !!form.pk"
            :rows="1"
            auto-grow
            placeholder="Enter private key"
            hint="64 charachters code that looks something like 4385...d77fa"
          />
          <div class="pk-actions">
            <div @click="cordovaReadQr">
              <ImageUpload
                ref="qr"
                :disabled="allLoading"
                :loading="allLoading"
                accept=".png"
                :show-file-name="false"
                text="QR code"
                :color="null"
                :icon="icons.qrcode"
                @fileChange="readQr($event)"
                @reset="resetQr()"
              />
            </div>
            <small class="half-transparent">OR</small>
            <div>
              <ImageUpload
                ref="key"
                :disabled="allLoading"
                :loading="allLoading"
                accept=".pk"
                :show-file-name="true"
                text="Select file"
                :color="null"
                :file-only="true"
                @fileChange="setKey"
                @reset="resetKey()"
              />
            </div>
          </div>
        </v-tab-item>
      </v-tabs-items>
    </PageContent>

    <PageFooter :padding="true">
      <v-btn large block :loading="allLoading" color="primary" @click="submit">
        Import
        <v-icon right>
          arrow_downward
        </v-icon>
      </v-btn>
    </PageFooter>
  </Page>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import Page from '@/common/components/Page.vue'
import PageHeader from '@/common/components/PageHeader.vue'
import PageFooter from '@/common/components/PageFooter.vue'
import PageContent from '@/common/components/PageContent.vue'
import ImageUpload from '@/common/components/ImageUpload.vue'
import { mapState } from 'vuex'
import { HTMLInputEvent, openFileAsBuffer, readQr } from '@/common/lib/open-file'
import {
  getBase64,
  bufferToBase64,
  getUint8Array,
  base64ToFile,
  base64ToBuffer
} from '@/common/lib/get-base64'
import { Wallet, MasterKey, CreateWalletOptions } from '@/common/store/Wallet/Wallet'
import {
  addTimeoutToPromise,
  handleTimeout,
  handleError
} from '@/common/lib/error-handling'
import store, { RootState, notify } from '@/common/store'
import { mdiQrcode } from '@mdi/js'
import { toSeedHex } from 'bip39-ts'
import { pause } from '@/common/lib/helpers'
import { getKeys, validateMnemonic, derivePath } from '@/common/lib/bip44'
import { getCache, setCache } from '@/common/lib/cache'
import getPlatform, { Platform } from '@/common/lib/get-platform'
import { cordovaReadQr } from '@/common/lib/open-file'
import { forgeTimeout } from '@/common/lib/constants'

@Component({
  components: {
    Page,
    PageHeader,
    PageFooter,
    PageContent,
    ImageUpload
  },
  computed: {
    ...mapState<RootState>({
      loading: ({ Common }) => Common.Loading.loading,
      forging: ({ Wallet }) => Wallet.forging,
      keystore: ({ Wallet }) => Wallet.keystore
    })
  }
})
export default class ImportWallet extends Vue {
  loading!: boolean
  forging!: boolean
  keystore!: MasterKey[]
  $refs!: {
    pk: HTMLInputElement
    qr: ImageUpload
    key: ImageUpload
  }
  icons = {
    qrcode: mdiQrcode
  }

  qrLoading = false
  pkLoading = false

  items = [
    { tab: 'One', title: 'Secret Phrase' },
    { tab: 'Two', title: 'Text/File/QR' }
  ]

  defaultForm = {
    backup: '',
    key: '',
    pk: null as File | null,
    qr: null as string | null,
    path: ''
  }

  form = { ...this.defaultForm }
  private tabModel = +getCache('preferedImportMethod', 0)

  set tab(value: number) {
    this.tabModel = value
    setCache('preferedImportMethod', value)
    if (value === 0) {
      setTimeout(() => (this.$refs as any).phrase.focus(), 500)
    }
    if (value === 1) {
      setTimeout(() => (this.$refs as any).pk.focus(), 500)
    }
  }

  get tab() {
    return this.tabModel
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

  @Watch('tab')
  reset() {
    this.form = { ...this.defaultForm }
    this.resetQr()
    this.resetKey()
  }

  resetQr() {
    try {
      this.$refs.qr.reset()
    } catch {
      // dirty
    }
    this.form.qr = null
  }

  resetKey() {
    try {
      this.$refs.key.reset()
    } catch {
      // dirty
    }
    this.form.key = ''
    this.form.pk = null
  }

  mounted() {
    this.tab = +getCache('preferedImportMethod', 0)
    this.$store.commit('Common/stopLoading')
  }

  get allLoading() {
    return this.forging || this.loading || this.qrLoading || this.pkLoading
  }

  get backup() {
    return this.form.backup
  }

  set backup(value: string) {
    this.form.backup = value
  }

  async setKey(file: File | null) {
    this.pkLoading = true
    let key = ''
    this.form.pk = file
    if (file) {
      const intArr = await getUint8Array(file)
      const buffer = Buffer.from(intArr as any).toString('hex')
      key = buffer
    } else {
      this.resetKey()
    }
    this.form.key = key
    this.pkLoading = false
    if (key) this.submit()
  }

  async cordovaReadQr(event) {
    if (getPlatform() !== Platform.Cordova) return
    event.stopPropagation()
    event.preventDefault()
    try {
      const qr = await cordovaReadQr()
      if (qr && qr.length > 0) {
        this.form.qr = qr
        this.submit()
      } else {
        this.resetQr()
      }
      console.log(qr)
    } catch (error) {
      handleError(error, error)
      this.resetQr()
    }
  }

  async readQr(file: File | null) {
    const { dispatch } = this.$store
    const notify = (text = 'Not a valid QR code. Please try again', error?: any) =>
      dispatch('Common/Notifications/notify', {
        text,
        duration: 2500,
        type: 'info',
        payload: { error }
      })
    this.qrLoading = true

    if (file) {
      try {
        const qr = await readQr(file)
        if (qr && qr.data) {
          this.form.qr = qr.data
          this.submit()
        } else {
          this.resetQr()
        }
      } catch (error) {
        this.resetQr()
        notify(error)
      }
    } else {
      this.resetQr()
    }
    this.qrLoading = false
  }

  get privateKey() {
    if (!this.tab || this.tab === 0) {
      if (!this.form.backup) return ''
      try {
        const seedHex: string = toSeedHex(this.form.backup.trim())
        const { key } = getKeys(seedHex, this.form.path || null)
        return key.toString('hex')
      } catch (error) {
        return ''
      }
    } else if (this.tab === 1 && this.form.qr) {
      return this.form.qr
    } else {
      return this.form.key
    }
  }

  get privateKeyBuffer() {
    return Buffer.from(this.privateKey || '', 'hex')
  }

  async submit() {
    const { dispatch, commit, state } = store
    let wallet: Wallet | null = null
    let errorText = 'Please select a valid import method and try again.'

    if (this.tab === 0 && !this.validMnemonic()) {
      errorText = 'Please use a valid secret phrase. Typicallly 12 words'
    }
    if ((this.tab === 0 && !this.validMnemonic()) || !this.privateKey) {
      return notify({
        text: errorText,
        duration: 3500,
        type: 'error',
        payload: { words: this.trimmedWords }
      })
    }

    try {
      const key = await this.getKey()
      await addTimeoutToPromise(
        dispatch.Wallet.forgeWallet({
          key,
          Uint8ArrayImport: this.privateKeyBuffer
        }),
        forgeTimeout
      )
    } catch (error) {
      commit.Wallet.setForging(false)
      handleError(error, error, 6000)
    } finally {
      this.reset()
    }
  }

  get trimmedWords() {
    return this.form.backup
      .split(' ')
      .map((w) => w.trim())
      .filter((w) => !!w)
  }

  validMnemonic() {
    const validMnemonic = validateMnemonic(this.trimmedWords.join(' '))
    return validMnemonic
  }

  get valid() {
    return !!this.form.pk || this.validMnemonic()
  }
}
</script>

<style scoped lang="scss">
.v-tabs-items {
  background: none !important;
}
.v-window-item {
  padding: 0;
}

.pk-actions {
  display: flex;
  flex-direction: row;
  align-items: center;
  & > small {
    padding: 0 0.75rem;
  }
}
</style>
