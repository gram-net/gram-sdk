<!-- @format -->

<template>
  <v-card :color="theme.color" :light="theme.light" :dark="theme.dark">
    <v-card-title class="title d-flex align-center py-3">
      <span> <v-icon class="mr-2">warning</v-icon>Action required </span>
      <v-spacer />
      <v-btn text small class="mr-n3">
        Back up
      </v-btn>
    </v-card-title>
    <v-card-text>
      <span>
        This wallet is not yet backed up. Back up this wallet now so you can retrieve your
        funds in case you lose access.
      </span>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import { Component, Vue, Emit, Watch } from 'vue-property-decorator'
import Page from '@/common/components/Page.vue'
import PageContent from '@/common/components/PageContent.vue'
import PageFooter from '@/common/components/PageFooter.vue'
import store, { notify } from '@/common/store'

@Component({
  components: {
    Page,
    PageContent,
    PageFooter
  }
})
export default class Template extends Vue {
  title = 'Template'

  mounted() {
    const { dispatch, commit } = store
    commit.Common.stopLoading()
  }

  get theme() {
    const dark = this.$vuetify.theme.dark
    return dark
      ? {
          color: 'rgba(255, 255, 255, .05)',
          light: false,
          dark: true
        }
      : {
          color: 'rgba(0, 0, 0, .05)',
          light: true,
          dark: false
        }
  }

  submit() {
    notify({
      text: 'Submitting works!',
      type: 'success',
      duration: Infinity,
      payload: {
        foo: 'bar'
      }
    })
  }
}
</script>
