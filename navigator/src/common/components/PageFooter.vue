<!-- @format -->

<template>
  <div class="page__footer" :class="{ 'type--padding': padding }">
    <div class="page__footer__container">
      <slot />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'

@Component({})
export default class PageFooter extends Vue {
  @Prop({ default: false }) padding!: boolean

  // mounted() {}
}
</script>

<style lang="scss" scoped></style>
