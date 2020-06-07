<!-- @format -->

<template>
  <v-dialog
    v-model="model"
    :width="width"
    :class="{ 'is--open': model }"
    overlay-opacity=".95"
    :name="name"
  >
    <v-card>
      <v-toolbar :color="color" dark class="base-dialog__header">
        <v-btn
          v-if="back"
          rounded
          icon
          class="dialog__header__back"
          @click="$emit('back')"
        >
          <v-icon>keyboard_backspace</v-icon>
        </v-btn>

        <v-toolbar-title>
          <span>{{ title }}</span>
        </v-toolbar-title>
        <v-spacer />
        <v-btn rounded icon class="dialog__header__close" @click="$emit('input', false)">
          <v-icon>close</v-icon>
        </v-btn>
      </v-toolbar>

      <slot />
    </v-card>
  </v-dialog>
</template>

<style lang="scss">
.v-dialog__container {
  display: block;
  z-index: 5000;
  position: fixed;

  .v-overlay.v-overlay--active {
    display: none;
  }
}
html.overflow-y-hidden {
  overflow-y: hidden;
}
.base-dialog__header {
  position: relative;
  z-index: 3;
}
</style>

<script lang="ts">
import { Component, Prop, Vue, Emit } from 'vue-property-decorator'

@Component({})
export default class BaseDialog extends Vue {
  @Prop({ type: String, default: 'primary' }) color!: string
  @Prop({ type: String, default: '' }) title!: string
  @Prop({ type: Number, default: 500 }) width!: number
  @Prop({ type: Boolean, default: false }) value!: boolean
  @Prop({ type: String, default: '' }) name!: string
  @Prop({ type: Boolean, default: false }) back!: string

  get model() {
    return this.value
  }
  set model(value) {
    this.$emit('input', false)
  }
}
</script>

<style scoped></style>
