<!-- @format -->

<template>
  <Page>
    <PageContent :width="650">
      <v-card>
        <v-card-title class="py-3" v-text="props.title">
          {{ props.title }}
          <v-spacer />
        </v-card-title>
        <v-divider />
        <v-card-text>
          <p class="mb-0" v-text="props.message" />
          <div v-if="expert" class="mt-6">
            <v-btn @click="collapsed = !collapsed">
              Log
              <v-icon
                right
                v-text="collapsed ? 'keyboard_arrow_down' : 'keyboard_arrow_up'"
              />
            </v-btn>
            <pre class="overflow-x-auto mt-3" :hidden="collapsed" v-text="errorParsed" />
          </div>
        </v-card-text>
      </v-card>
    </PageContent>
    <PageFooter :padding="true">
      <v-btn to="/" large block>
        Home
        <v-icon right v-text="'home'" />
      </v-btn>
    </PageFooter>
  </Page>
</template>

<script lang="ts">
import { Component, Prop, Vue, Emit, Watch } from 'vue-property-decorator'
import Page from '@/common/components/Page.vue'
import PageContent from '@/common/components/PageContent.vue'
import PageFooter from '@/common/components/PageFooter.vue'
import store from '@/common/store'

@Component({
  components: {
    Page,
    PageContent,
    PageFooter
  }
})
export default class SomethingWrong extends Vue {
  @Prop({
    default: 'Try again or if this this problem keeps occuring contact support'
  })
  message!: string
  collapsed = false
  @Prop({ default: 'Something went wrong' }) title!: string
  @Prop({ default: 'An unknown error occured' }) error!: any

  mounted() {
    this.stopLoading()
  }

  get expert() {
    return store.state.Common.Settings.mode === 'expert'
  }

  // stop loading on route params change
  @Watch('message')
  @Watch('title')
  @Watch('error')
  @Watch('$route.meta.props')
  stopLoading() {
    const { commit } = store
    commit.Common.stopLoading()
  }

  async back() {
    await this.$router.replace('/force-rerender')
    this.$router.go(-1)
  }

  get props() {
    // get props from route.meta.props or passed component props
    const componentProps = {
      message: this.message,
      title: this.title,
      error: this.error
    }
    const props = this.$route.meta.props || componentProps
    return props
  }

  get errorParsed() {
    const { error } = this.props
    return error === 'string' ? error : JSON.stringify(error, null, 2)
  }
}
</script>
