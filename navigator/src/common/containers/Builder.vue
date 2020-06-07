<!-- @format -->

<script lang="ts">
import { Component, Vue, Emit } from 'vue-property-decorator'
import { mapState } from 'vuex'
import { join } from 'path'
import PageContent from '@/common/components/PageContent.vue'
import Page from '@/common/components/Page.vue'
import PageFooter from '@/common/components/PageFooter.vue'
import { NotificationsState } from '@/common/store/Common/Notifications'
import { LoadingState } from '@/common/store/Common/Loading'
import { Notification as NotificationModel } from '@/common/models/notification'
import store, { RootState, notify } from '@/common/store'
import { handleError } from '@/common/lib/error-handling'
import TestWasm from '@gram-net/wasm/dist/__tests__/test-wasm.js'
import fetch from 'node-fetch'

import {
  funcStdlib,
  simpleWalletCodeFc,
  Fiftfif,
  Asmfif,
  TonUtilFif,
  ListsFif,
  newWallet
} from '@gram-net/wasm/dist/fixt-files.js'
import { FIXT, sleep } from '@gram-net/wasm'
import { openFileAsBuffer } from '@/common/lib/open-file'
import { promises as fsp, readFileSync } from 'fs'
import path from 'path'

@Component({
  computed: {
    ...mapState<RootState>({
      loading: (state) => state.Common.Loading.loading,
      notifications: (state) => state.Common.Notifications.notifications
    })
  },
  components: {
    Page,
    PageContent,
    PageFooter
  }
})
export default class Builder extends Vue {
  notifications!: NotificationModel[]
  notifyData = {
    text: 'Hello World',
    type: 'error',
    duration: 3000,
    payload: {
      error: 'custom error data'
    } as any
  }
  fiftLoading = false
  funcLoading = false

  get nextHelpStep() {
    const { dispatch } = store
    return dispatch.Common.Help.nextHelpStep
  }

  async mounted() {
    const { commit, dispatch, state } = this.$store

    commit('Common/stopLoading')
  }

  async runTest(testStr, imports) {
    let testWasm = new TestWasm(imports)
    await testWasm.runTest(testStr)
  }

  async testFift(cmds) {
    this.fiftLoading = true

    const { fiftObj, fiftObjAsync, funcObj, funcObjAsync } = this.$store.state.GramWasm

    await this.runTest('fift-script-fail', { fiftObj: fiftObj })
    await this.runTest('fift-script-success', { fiftObj: fiftObj })
    await this.runTest('fift-interactive-fail', { fiftObj: fiftObjAsync })
    await this.runTest('fift-interactive-success', {
      fiftObj: fiftObjAsync
    })

    this.fiftLoading = false
  }

  async testFunc(cmds) {
    this.funcLoading = true

    const { fiftObj, fiftObjAsync, funcObj, funcObjAsync } = this.$store.state.GramWasm

    await this.runTest('func-script-fail', { funcObj: funcObj })
    await this.runTest('func-script-success', { funcObj: funcObj })
    // await this.runTest("func-interactive-fail");
    // await this.runTest("func-interactive-success");
    this.funcLoading = false
  }

  async submit() {
    this.$store.dispatch('Common/Notifications/notify', {
      type: 'success',
      text: 'Submitted works!',
      duration: 1500
    })
  }
}
</script>

<template>
  <Page>
    <PageContent>
      <div>
        <v-btn
          color="primary"
          :loading="fiftLoading"
          :disabled="fiftLoading"
          @click="testFift()"
        >
          Test Fift
        </v-btn>
      </div>
      <br /><br />
      <div>
        <v-btn
          color="secondary"
          :loading="funcLoading"
          :disabled="funcLoading"
          @click="testFunc()"
        >
          Test Func
        </v-btn>
      </div>
    </PageContent>
    <PageFooter :padding="true">
      <v-btn
        :loading="loading"
        color="primary"
        large
        block
        name="gram-wasm-submit"
        @click="submit"
      >
        Submit
      </v-btn>
    </PageFooter>
  </Page>
</template>

<style lang="scss" scoped></style>
