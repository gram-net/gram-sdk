<!-- @format -->

<template>
  <v-sheet
    class="overlay"
    :class="{ 'is--loading': loadingOverlay }"
    :dark="$vuetify.theme.dark"
  >
    <v-container fluid>
      <div class="status">
        {{ status }}
      </div>

      <v-progress-circular class="circle" :size="55" indeterminate color="yellow" />

      <div v-if="redirectButton" class="actions">
        <v-btn mt-3 :to="redirectButton[1]">
          {{ redirectButton[0] }}
        </v-btn>
      </div>
    </v-container>
  </v-sheet>
</template>

<script lang="ts">
import { Component, Prop, Vue, Emit, Watch } from 'vue-property-decorator'
import { mapState } from 'vuex'
import { RootState } from '../store'
import { LoadingState } from '../store/Common/Loading'

@Component({
  computed: {
    ...mapState<RootState>({
      status: (state) => state.Common.Loading.status,
      loadingOverlay: (state) => state.Common.Loading.loadingOverlay,
      loading: (state) => state.Common.Loading.loading,
      redirectButton: (state) => state.Common.Loading.redirectButton
    })
  }
})
export default class loadingOverlay extends Vue {
  soundTimer: any
  loading!: LoadingState['loading']
  redirectButton!: LoadingState['redirectButton']
  loadingOverlay!: LoadingState['loadingOverlay']
  status!: LoadingState['status']

  @Watch('loading')
  loadingChange(loading: boolean) {
    // play after some delay to avoid annoyance
    loading
      ? (this.soundTimer = setTimeout(() => {
          if (this.loading) this.$store.dispatch('Common/playLoading')
        }, 1000))
      : clearTimeout(this.soundTimer)
  }
}
</script>

<style scoped lang="scss">
.status {
  text-align: center;
  display: block;
  margin: 30px auto;
  font-size: 1.5rem;
  opacity: 0.7;
}
.actions {
  text-align: center;
  display: block;
  margin: 30px auto;
  pointer-events: all;
}
.circle {
  margin: 1rem auto;
  display: block;
  color: #edc036;
}
.overlay {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  right: 0;
  border-radius: 0;
  margin-top: 0;
  z-index: 300;
  top: 0px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  opacity: 0;
  min-height: 100vh;
  transition: 0.25s ease;
  visibility: hidden;
  pointer-events: all;

  &.is--loading {
    opacity: 1;
    visibility: visible;
  }
}
</style>
