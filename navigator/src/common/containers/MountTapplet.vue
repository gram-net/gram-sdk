<!-- @format -->

<template>
  <Page>
    <PageContent>
      <v-card class="pa-0">
        <v-card-title class="pb-3 card-title type--flex" name="tapplet-title">
          {{ (component && component.name) || title }}
          <v-btn
            v-if="component"
            text
            :disabled="updating"
            @click="unmount(component.name)"
          >
            Unmount
          </v-btn>
        </v-card-title>

        <v-divider />

        <iframe
          v-if="component && component.path"
          name="tapplet-iframe"
          :src="`${component.path}/index.html`"
        />

        <v-card-text v-else-if="unsupported">
          Unfortunately Tapplets are not (yet) supported in the browser.
        </v-card-text>

        <v-card-text v-else>
          Please select a Tapplet from your device.
          <br />The Tapplet file needs to be a <b>.zip</b> that contains at least an
          <b>index.html</b> file.
        </v-card-text>
      </v-card>

      <div v-if="tapplets && tapplets.length > 0" class="mt-8 pl-3 pr-3">
        <v-card-title class="pb-3 pl-0 card-title">
          Tapplets
        </v-card-title>
        <v-divider />
        <v-list
          two-line
          subheader
          color="transparent"
          :class="{ 'half-transparent unclickable': updating }"
        >
          <v-list-item
            v-for="tapplet of tapplets"
            :key="tapplet"
            class="pr-0 pl-0"
            :name="`tapplet-item-${tapplet}`"
          >
            <v-list-item-content>
              <v-list-item-title class="type--flex">
                <span name="tapplet-item-name">{{ tapplet }}</span>

                <v-btn
                  v-if="!component || tapplet !== component.name"
                  text
                  name="tapplet-item-mount"
                  @click="mount(tapplet)"
                >
                  Mount
                </v-btn>
                <v-btn
                  v-if="component && tapplet === component.name"
                  text
                  name="tapplet-item-unmount"
                  :disabled="updating"
                  @click="unmount(tapplet)"
                >
                  Unmount
                </v-btn>
              </v-list-item-title>
            </v-list-item-content>

            <v-list-item-action>
              <v-icon
                class="half-transparent"
                :disabled="updating"
                name="tapplet-item-delete"
                @click="remove(tapplet)"
              >
                delete
              </v-icon>
            </v-list-item-action>
          </v-list-item>
        </v-list>
      </div>
    </PageContent>

    <PageFooter :padding="true">
      <v-btn
        :loading="loading || updating"
        color="primary"
        large
        block
        :disabled="unsupported"
        name="select-tapplet"
        @click.prevent="$refs.file.click()"
      >
        <v-icon left> add </v-icon>Tapplet (.zip)
      </v-btn>
      <input
        ref="file"
        type="file"
        accept="application/zip"
        hidden
        name="tapplet-file"
        @change="fileChange"
      />
    </PageFooter>
  </Page>
</template>

<style scoped>
iframe {
  border: 0;
  width: 100%;
  display: block;
  height: 650px;
}
</style>

<script lang="ts">
import { Component, Vue, Emit } from 'vue-property-decorator'
import { mapState } from 'vuex'
import { HTMLInputEvent } from '@/common/lib/open-file'
import { Tapplet } from '@/common/store/TappletLauncher/TappletLauncher'
import { base } from '@/common/lib/cordova-fs'
import { RootState, notify } from '@/common/store'

import Page from '@/common/components/Page.vue'
import PageContent from '@/common/components/PageContent.vue'
import PageFooter from '@/common/components/PageFooter.vue'
import getPlatform from '../lib/get-platform'

@Component({
  components: {
    Page,
    PageContent,
    PageFooter
  },
  computed: {
    ...mapState<RootState>({
      loading: (state) => state.Common.Loading.loading,
      tapplets: (state) => state.TappletLauncher.tapplets,
      component: (state) => state.TappletLauncher.mounted
    })
  }
})
export default class MountTapplet extends Vue {
  title = 'Hi, welcome stranger'
  $refs!: {
    frame: HTMLDivElement
    file: HTMLInputElement
  }
  loading!: boolean
  tapplets!: Tapplet[]
  component!: Tapplet | null
  updating = false
  platform = getPlatform()
  unsupported = this.platform === 'browser' || this.platform === 'cordova browser'

  async mounted() {
    const { dispatch, commit } = this.$store

    try {
      await dispatch('TappletLauncher/syncDir')
    } catch (error) {
      notify({
        text: "Couldn't get tapplets",
        type: 'error',
        duration: 1500,
        payload: { error }
      })
    }
    commit('Common/stopLoading')
  }

  async remove(name: string) {
    const { dispatch } = this.$store
    if (this.updating) return
    this.updating = true
    try {
      const confirmed = await this.$confirm('Are you sure you want to remove ' + name)
      if (confirmed) await dispatch('TappletLauncher/remove', name)
    } catch (error) {
      dispatch('Common/Notifications/notify', {
        text: "Couldn't remove",
        type: 'error',
        duration: 1500,
        payload: { error }
      })
    }
    this.updating = false
  }

  async save(file: File) {
    const { dispatch } = this.$store
    if (this.updating) return
    this.updating = true
    try {
      await dispatch('TappletLauncher/save', file)
    } catch (error) {
      notify({
        text: "Couldn't add Tapplet",
        type: 'error',
        duration: 1500,
        payload: { error }
      })
    }
    this.updating = false
  }

  unmount(name: string) {
    const { commit, dispatch } = this.$store
    commit('TappletLauncher/unmount')
  }

  mount(name: string) {
    const { commit, dispatch } = this.$store
    commit('TappletLauncher/mount', name)
  }

  fileChange(event: HTMLInputEvent) {
    const { dispatch } = this.$store
    const files = event.target.files
    if (files && files[0]) {
      const file = files[0]
      this.$refs.file.value = ''
      this.save(file)
    }
  }
}
</script>

<style lang="scss" scoped></style>
