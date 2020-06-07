<!-- @format -->

<template>
  <Page>
    <PageContent>
      <v-card class="pb-0">
        <v-card-actions>
          <v-btn text class="half-transparent" @click="exportStorage">
            Export
            <v-icon right>
              file_copy
            </v-icon>
          </v-btn>
          <v-btn text class="half-transparent" @click="clear">
            Clear
            <v-icon right>
              block
            </v-icon>
          </v-btn>
          <v-spacer />
          <v-btn text color="primary" @click="importStorage">
            Import
            <v-icon right>
              save_alt
            </v-icon>
          </v-btn>
        </v-card-actions>
        <v-divider />
        <v-textarea
          ref="input"
          v-model="form.data"
          rows="5"
          class="type--depressed pa-1"
          solo
          auto-grow
          placeholder="Paste a json string to import to LocalStorage"
        />
      </v-card>
    </PageContent>
  </Page>
</template>

<script lang="ts">
import { Component, Vue, Emit, Watch } from 'vue-property-decorator'
import Page from '@/common/components/Page.vue'
import PageContent from '@/common/components/PageContent.vue'
import PageFooter from '@/common/components/PageFooter.vue'
import store, { notify } from '@/common/store'
import { handleError } from '../lib/error-handling'
import { pause } from '../lib/helpers'

@Component({
  components: {
    Page,
    PageContent,
    PageFooter
  }
})
export default class LocalStorage extends Vue {
  form = {
    data: ''
  }

  async mounted() {
    await pause(200)
    ;(this.$refs.input as any).focus()
    store.commit.Common.stopLoading()
  }

  get storage() {
    const data = JSON.stringify(localStorage, null, 2)
    return data
  }

  set storage(value: string) {
    try {
      const obj = JSON.parse(value)
      if (typeof obj !== 'object') return
      localStorage.clear()
      Object.entries(obj).forEach(([key, val]) => {
        localStorage.setItem(key, val + '')
      })
    } catch (error) {
      console.warn(error)
    }
  }

  async importStorage() {
    const yes = await this.$confirm(
      'Do you really want to overwrite all app data including wallets and keys?'
    )
    if (!yes) return
    try {
      const obj = JSON.parse(this.form.data)
      console.log(obj)
      if (typeof obj !== 'object') return
      localStorage.clear()
      Object.entries(obj).forEach(([key, val]) => {
        localStorage.setItem(key, val + '')
      })

      await notify({
        text: 'Imported ' + this.form.data.slice(0, 60) + '...',
        duration: 1000,
        payload: localStorage
      })
      this.form.data = ''
      location.reload()
    } catch (error) {
      handleError(error, error)
    }
  }

  exportStorage() {
    store.dispatch.Common.copy(JSON.stringify(localStorage))
  }

  async clear() {
    const { dispatch } = store
    const yes = await this.$confirm(
      'Do you really want to clear all app data including wallets and keys?'
    )
    if (yes) {
      localStorage.clear()
      location.reload()
    }
  }
}
</script>

<style lang="scss">
.type--depressed {
  .v-input__slot {
    box-shadow: none !important;
  }
  .v-input__slot {
    margin-bottom: 0;
  }
  .v-text-field__details {
    display: none;
  }
}
</style>
