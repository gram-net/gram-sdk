<!-- @format -->

<template>
  <Page>
    <PageContent class="text-center" :width="400">
      <v-expand-transition>
        <pin-pad v-if="step === 0" v-model="createdPin" @submit="create" />
      </v-expand-transition>
      <v-expand-transition>
        <div v-if="step === 1">
          <div class="text-center half-transparent">
            Type again to verify
          </div>
          <v-divider class="mt-4" />
          <pin-pad v-model="verifiedPin" @submit="verify" />
        </div>
      </v-expand-transition>
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
export default class CreatePin extends Vue {
  redirectURL = '/wallets'
  createdPin = ''
  verifiedPin = ''
  step = 0

  beforeMount() {
    const saved = store.state.Common.Login.pin
    if (this.savedPin) {
      this.$router.push(this.$route.params.redirect || this.redirectURL)
    }
  }

  mounted() {
    store.commit.Common.stopLoading()
  }

  get savedPin() {
    return store.state.Common.Login.pin
  }

  create(pin: string) {
    this.step = 1
  }

  async verify(pin: string) {
    try {
      await store.dispatch.Common.Login.create(pin)
      await pause(200)
      notify({
        text: 'Successfuly created PIN',
        duration: 2500,
        type: 'success'
      })
      this.redirect()
    } catch (error) {
      handleError(error, error)
    }
  }

  redirect() {
    return this.$router.push((this.$route.query.redirect as string) || this.redirectURL)
  }
}
</script>

<style></style>
