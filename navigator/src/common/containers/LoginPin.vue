<!-- @format -->

<template>
  <Page>
    <PageContent class="text-center" :width="400">
      <pin-pad v-model="form" @submit="login" />
    </PageContent>
  </Page>
</template>

<script lang="ts">
import { Component, Vue, Emit, Watch } from 'vue-property-decorator'
import Page from '@/common/components/Page.vue'
import PageContent from '@/common/components/PageContent.vue'
import PageFooter from '@/common/components/PageFooter.vue'
import PinPad from '@/common/components/PinPad.vue'
import store, { notify } from '@/common/store'
import { encrypt, decrypt } from '../lib/crypto'
import { handleError } from '../lib/error-handling'
import { pause } from '../lib/helpers'

@Component({
  components: {
    Page,
    PageContent,
    PageFooter,
    PinPad
  }
})
export default class Pin extends Vue {
  redirectURL = '/wallets'
  form = ''

  beforeMount() {
    if (!this.pinCreated) {
      this.$router.push({
        path: '/create-pin',
        params: {
          redirect: (this.$route.query.redirect as string) || this.redirectURL
        }
      })
    }
  }

  mounted() {
    store.commit.Common.stopLoading()
  }

  get pinCreated() {
    return store.state.Common.Login.pinCreated
  }

  async login(pin: string) {
    try {
      await store.dispatch.Common.Login.login(pin)
      await pause(200)
      this.redirect()
    } catch (error) {
      handleError(error, 'Wrong PIN')
      this.form = ''
    }
  }

  redirect() {
    return this.$router.push((this.$route.query.redirect as string) || this.redirectURL)
  }
}
</script>
