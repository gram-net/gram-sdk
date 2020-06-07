<!-- @format -->

<template>
  <div class="dialog" :class="{ 'is--open': open }">
    <div class="dialog__backdrop" @click="$emit('close')" />

    <section class="dialog__frame">
      <header class="dialog__frame__header">
        {{ title }}
        <img
          class="dialog__frame__header__close"
          :src="require('@/apps/lotton/assets/close.svg')"
          @click="$emit('close')"
        />
      </header>

      <main class="dialog__frame__slot">
        <slot />
      </main>
    </section>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { Ticket as TicketModel } from '../models/ticket'
import { downsampleBase64 } from '@/common/lib/get-base64'

@Component({})
export default class Dialog extends Vue {
  @Prop({ type: String, default: null }) title!: string
  @Prop({ type: Boolean, default: false }) open!: boolean

  // mounted() {}
}
</script>

<style lang="scss">
@import '../styles/functions';

.dialog {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transition: 0.5s ease;
  z-index: 900;

  &.is--open {
    opacity: 1;
    visibility: visible;
    pointer-events: all;
  }

  &__backdrop {
    background: var(--color-dark-1);
    opacity: 0.85;
    width: 100%;
    height: 100%;
    cursor: pointer;
  }

  &__frame {
    background: var(--color-dark-3);
    color: white;
    position: relative;
    z-index: 5;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    max-width: rem(280);
    width: 100%;
    border-radius: var(--radius);
    box-shadow: 0 2px 74px 0 rgba(black, 0.4);

    &__header {
      padding: rem(13.5) rem(20);
      font-weight: bold;
      color: white;
      font-size: rem(19);
      position: relative;
      padding-right: rem(50);

      &__close {
        position: absolute;
        top: 50%;
        right: rem(20);
        transform: translateY(-50%);
        cursor: pointer;
        transition: 0.15s ease-in-out;

        &:hover {
          filter: brightness(2.5);
        }
      }
    }
  }
}

.dialog-item {
  box-shadow: none;
  outline: none;
  appearance: none;
  font: inherit;
  color: inherit;
  width: 100%;
  display: block;
  text-align: left;
  font-size: 1rem;
  color: var(--color-text-dim-2);
  font-weight: 500;
  border-top: 1px solid var(--color-border);
  padding: rem(15) rem(20);
  transition: 0.15s ease-in-out;
  cursor: pointer;
  overflow: hidden;

  &:hover {
    background: rgba(black, 0.15);
    color: white;
  }

  &__addon {
    font-size: rem(14);
    float: right;
    margin-left: rem(7);
    color: var(--color-text-dim);
  }
}
</style>
