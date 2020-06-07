<!-- @format -->

<template>
  <div :class="`notification-wrapper ${className}`">
    <v-alert
      transition="notification-transition"
      :value="show"
      :elevation="elevation"
      class="notification"
      :type="notification.type"
    >
      <v-row>
        <v-col class="pa-0 pl-2 pr-2 grow break" v-text="notification.text" />
        <v-col class="pa-0 text-right shrink">
          <v-btn x-small text @click.stop="open">
            open
          </v-btn>
        </v-col>
      </v-row>
    </v-alert>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { Notification as NotificationModel } from '@/common/models/notification'
import { pause } from '../lib/helpers'

@Component({})
export default class Notification extends Vue {
  @Prop() notification!: NotificationModel
  @Prop({ default: 0 }) elevation!: number
  @Prop({ default: true }) show!: boolean
  className = ''
  timer: any

  mounted() {
    this.timer = setTimeout(() => {
      this.className = 'animate--in'
    }, 25)
  }

  async open() {
    this.$store.dispatch('Common/startLoading', {
      command: 'startLoadingOverlay',
      value: 'Loading…'
    })
    this.$store.dispatch('Common/playClick')
    await pause(50)
    await this.$router.push('/force-rerender')
    this.$router.push({ path: '/notification/' + this.notification.id }).then(() => {
      this.$store.commit('Common/stopLoading')
      this.$store.commit('Common/Notifications/dismiss', this.notification.id)
    })
  }

  destroyed() {
    clearTimeout(this.timer)
    this.className = ''
  }
}
</script>

<style scoped>
.break {
  word-break: break-word;
}
</style>

<style>
.notification {
  width: 100%;
  font-size: 1rem;
}

.notification-wrapper.animate--in {
  transform: translateX(0);
  opacity: 1;
  filter: blur(0);
  max-height: 400px;
}

.notification-wrapper {
  opacity: 0;
  transition: 0.3s ease-in;
  transform: translateX(100px);
  filter: blur(2rem);
  max-height: 0;
}
</style>
