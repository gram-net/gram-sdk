<!-- @format -->

<template>
  <div
    class="input-group"
    :class="{
      'has--addon': addon,
      'has--label': label,
      'is--focused': focused,
      'is--blurred': !focused,
      'is--dropdown': dropdown
    }"
  >
    <label v-if="label" class="input-group__label" :for="id">
      {{ label }}
      <img
        v-if="dropdown"
        class="input-group__label__dropdown"
        :src="require('@/apps/lotton/assets/caret-down.svg')"
      />
    </label>
    <input
      :id="id"
      v-model="model"
      :type="type"
      class="input-group__input"
      :readonly="dropdown"
      @focus="
        focused = true
        $emit('focus')
      "
      @blur="
        focused = false
        $emit('blur')
      "
    />
    <span v-if="addon" class="input-group__addon">{{ addon }}</span>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

@Component({})
export default class TextField extends Vue {
  focused = false
  @Prop({ type: String, default: 'text' }) type!: string
  @Prop({ type: String, default: null }) id!: string
  @Prop({ type: String, default: null }) addon!: string
  @Prop({ type: Boolean, default: false }) dropdown!: boolean
  @Prop({ type: String, default: null }) label!: string
  @Prop({ type: [String, Number], default: null }) value!: string | number

  get model() {
    return this.value
  }
  set model(value: string | number) {
    this.$emit('input', value)
  }
}
</script>

<style lang="scss">
@import '../styles/functions';

.input-group {
  --label-size: 7rem;
  --addon-size: 7.5rem;

  border-radius: var(--radius);
  background: rgba(0, 0, 0, 0.05);
  display: block;
  height: rem(52);
  align-items: center;
  font-size: 0.8125rem;
  color: var(--color-text-dim);
  transition: 0.3s ease;
  overflow: hidden;
  border: 1px solid var(--color-border);
  transition: 0.3s ease-in-out;

  &:hover {
    box-shadow: 0 2px 14px 0 rgba(0, 0, 0, 0.25);
  }

  &.is--dropdown {
    cursor: pointer;
    * {
      pointer-events: none;
    }
  }

  &.is--focused {
    color: white;
    border-color: var(--color-secondary);
    background: rgba(0, 0, 0, 0.15);
  }

  &__input {
    padding: 0 0.625rem;
    margin: 0;
    display: block;
    width: 100%;
    line-height: 2.5rem;
    font-family: inherit;
    font-size: inherit;
    color: inherit;
    float: left;
    box-shadow: none !important;
    outline: none !important;
    appearance: none;
    border: none;
    background: none;
    font-size: rem(18);
    line-height: rem(32);
    height: rem(32);
    margin-top: rem(9);
    font-weight: 500;

    .input-group.has--label.has--addon & {
      width: calc(100% - var(--addon-size) - var(--label-size));
    }
    .input-group.has--addon & {
      width: calc(100% - var(--addon-size));
    }
    .input-group.has--label & {
      width: calc(100% - var(--label-size));
    }
  }

  &__label {
    width: var(--label-size);
    border-right: 1px solid var(--color-border);
    height: rem(32);
    padding: 0 0.75rem;
    font-size: inherit;
    color: var(--color-text-dim-2);
    font-weight: 500;
    font-size: rem(14);
    margin-top: rem(9);
    float: left;
    line-height: rem(32);
    transition: 0.3s ease;
    overflow: hidden;

    &__dropdown {
      float: right;
      margin-top: rem(11);
      opacity: 0.6;
    }
  }

  &__addon {
    width: var(--addon-size);
    align-items: center;
    padding: 0 0.65rem 0 0;
    float: right;
    text-align: right;
    line-height: rem(32);
    height: rem(32);
    margin-top: rem(9);
    font-weight: 500;

    color: var(--color-text-dim-2);
    font-size: rem(14);
    position: relative;
  }
}
</style>
