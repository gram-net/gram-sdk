<!-- @format -->

<template>
  <div class="page" :class="{ 'has--footer': hasFooter, 'has--header': hasHeader }">
    <slot />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'

@Component({})
export default class Page extends Vue {
  hasHeader = false
  hasFooter = false

  mounted() {
    this.checkChildren()
  }

  @Watch('$children')
  checkChildren() {
    this.hasHeader = !!this.$children
      .map((c) => c.$el)
      .find((el) => el.classList.contains('page__header'))
    this.hasFooter = !!this.$children
      .map((c) => c.$el)
      .find((el) => el.classList.contains('page__footer'))
  }
}
</script>

<style lang="scss">
.page {
  position: relative;
  display: flex;
  flex-flow: column;
  flex-grow: 1;

  &__content {
    flex-grow: 1;
    position: relative;

    &__scroll {
      position: absolute;
      top: 0;
      right: 0;
      left: 0;
      bottom: 0;
      overflow-x: hidden;
      overflow-y: auto;
    }
  }

  &__footer {
    flex-shrink: 1;

    $color-dark: #121212;
    $color-light: #fff;

    &.type--padding {
      padding: 1.25rem 1rem;
      // background: rgba(black, 0.7);
      // border-top: 1px solid rgba(white, 0.1);
      // border-bottom: 1px solid rgba(white, 0.1);
      background: $color-dark;
      position: relative;
      &:after {
        position: absolute;
        bottom: 99%;
        content: '';
        height: 70px;
        left: 0;
        right: 0;
        z-index: 1;
        background: linear-gradient(transparent, $color-dark);
        pointer-events: none;
      }

      @media screen and (max-width: 960px) {
        padding: 1.25rem 0.5rem;
        .v-btn.v-size--large {
          padding: 0 16px;
        }
      }

      @media screen and (max-width: 600px) {
        padding: 1.25rem 0.75rem;
        .v-btn.v-size--large {
          padding: 0 12.5px;
        }
      }

      .page__footer__container {
        width: 100%;
        max-width: calc(500px - 32px);
        margin: auto;
      }

      .v-application.theme--light & {
        // background: darken(white, 2%);
        // border-top-color: rgba(grey, 0.08);
        // border-bottom-color: rgba(grey, 0.08);
        background: $color-light;
        &:after {
          background: linear-gradient(transparent, $color-light);
        }
      }
    }
  }
}
</style>
