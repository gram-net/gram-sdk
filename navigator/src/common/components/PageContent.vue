<!-- @format -->

<template>
  <div class="page__content" :class="{ 'is--disabled': disabled }">
    <div class="page__content__scroll">
      <div
        class="page__content__scroll__container"
        :class="{ 'd-flex': flex }"
        :style="{ 'max-width': maxWidth }"
      >
        <slot />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

@Component({})
export default class PageContent extends Vue {
  @Prop() disabled!: boolean
  @Prop() flex!: boolean
  @Prop({ default: 500 }) width!: number | string

  get maxWidth() {
    return isNaN(this.width as any) ? this.width + '' : this.width + 'px'
  }
}
</script>

<style scoped lang="scss">
.page__content {
  transition: 0.3s ease-in;
}

.page__content__scroll__container {
  margin: auto;
  padding: 2.75rem 1rem 3.5rem;
  min-height: 100%;
  max-width: 500px;

  @media screen and (max-width: 960px) {
    padding: 2rem 1rem 3.5rem;
  }

  @media screen and (max-width: 600px) {
    padding: 1.5rem 1rem 3.5rem;
  }
}

.page__content.is--disabled {
  opacity: 0.4;
  pointer-events: none;
}
</style>
