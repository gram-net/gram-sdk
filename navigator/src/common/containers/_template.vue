<!-- @format -->

<template>
  <Page>
    <PageContent>
      <pre>{{ title }}</pre>
    </PageContent>
    <PageFooter :padding="true">
      <v-btn block color="primary" large @click="submit">
        Submit
      </v-btn>
    </PageFooter>
  </Page>
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
    store.commit.Common.stopLoading()
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
