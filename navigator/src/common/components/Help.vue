<!-- @format -->

<template>
  <div :class="{ 'elevation-3': help.open }" style="position: relative; z-index: 3;">
    <!-- <v-overlay :value="showOverlay" z-index="4" opacity=".9">
      <div @click="closeHelp" class="v-overlay-click"></div>
    </v-overlay>-->
    <div class="help-drawer" :class="{ 'is--open': help.open }">
      <h5 class="help-drawer__content">
        <span
          v-for="(step, i) in help.steps"
          :key="i"
          :class="{ 'is--active': i === help.activeIndex }"
          >{{ step.content }}</span
        >
      </h5>

      <div class="help-drawer__action">
        <v-btn
          v-if="!last"
          icon
          light
          class="half-transparent"
          :dark="!$vuetify.theme.dark"
          @click="next"
        >
          <v-icon>keyboard_arrow_right</v-icon>
        </v-btn>
        <v-btn
          v-else
          icon
          class="half-transparent"
          light
          :dark="!$vuetify.theme.dark"
          @click="closeHelp"
        >
          <v-icon>close</v-icon>
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Emit, Watch } from 'vue-property-decorator'
import store, { notify } from '@/common/store'

@Component({
  components: {}
})
export default class Template extends Vue {
  title = 'Help'

  get help() {
    return store.state.Common.Help
  }

  get showOverlay() {
    return store.getters.Common.Help.showHelpOverlay
  }

  get last() {
    return store.getters.Common.Help.lastHelpStep
  }

  closeHelp() {
    store.commit.Common.Help.setHelpOpen(false)
    setTimeout(() => {
      store.commit.Common.Help.setActiveIndex(0)
    }, 300)
  }

  openHelp() {
    store.commit.Common.Help.setHelpOpen(true)
  }

  next() {
    store.dispatch.Common.Help.nextHelpStep()
  }

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

<style lang="scss">
[data-help-mode='true']:not([data-help-overlay='false']) {
  .help-step:not(.help--active) {
    display: none;
  }
}

[data-help] {
  &[data-help-active='true'] {
    position: relative;
    z-index: 10000;
    box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.2), 0 4px 5px 0 rgba(0, 0, 0, 0.14);
  }
}

.help-drawer {
  overflow: hidden;
  transition: all 0.5s ease;
  text-align: center;
  max-height: 0;
  background: white;
  box-shadow: inset 0 2px 7px -1px rgba(0, 0, 0, 0.4);
  color: grey;
  position: relative;

  .theme--light & {
    background: #1e1e1e;
    color: grey;
  }

  &__action {
    position: absolute;
    top: 50%;
    right: 0.5rem;
    transform: translateY(-50%);
    z-index: 2;
  }

  &__content {
    position: relative;
    font-size: 16px;
    margin: 0;
    line-height: 1.4;
    padding: 1rem 2.5rem;
    font-weight: 450;

    & > span {
      overflow: hidden;
      opacity: 0;
      max-height: 0;
      display: block;
      position: relative;
      transition: none;
      transition: opacity 0.7s ease-out, transform 0.4s ease-out;
      transform: translateX(30%);

      &.is--active {
        max-height: 150px;
        opacity: 1;
        z-index: 2;
        transform: translateX(0);
      }
    }
  }

  &.is--open {
    max-height: 150px;
  }
}

.v-overlay-click {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}
</style>
