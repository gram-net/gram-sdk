<!-- @format -->

<template>
  <v-img
    ref="img"
    :src="identicon"
    :size="size"
    class="identicon"
    :class="{ 'is--lg': size > 50 }"
  />
</template>

<script lang="ts">
import { Component, Vue, Emit, Watch, Prop } from 'vue-property-decorator'
import { gram, time } from '@/common/lib/format'
import { identicon } from '@/common/lib/identicon'
import { Wallet } from '@/common/store/Wallet/Wallet'

@Component({
  filters: {
    gram,
    time
  }
})
export default class WalletItem extends Vue {
  @Prop({ default: '' }) seed!: string
  @Prop({ default: 'base64' }) type!: string
  @Prop({ default: 26 }) size!: number

  get identicon() {
    const icon = identicon(this.seed, this.type)
    if (icon) return icon.toDataURL()
    else return ''
  }
}
</script>

<style lang="scss">
.identicon {
  $offset: -4px;
  $scale: 0.9;
  $dark: #1e1e1e;
  $light: #fff;
  $border: 2px;
  $border-lg: 3px;

  width: inherit;
  height: inherit;
  cursor: pointer;

  &:after {
    content: '';
    background: linear-gradient(to bottom, #d82b7e, #f57939);
    border-radius: 50%;
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: -1;
  }

  .v-image__image {
    height: calc(100% - (#{$border} * 2));
    width: calc(100% - (#{$border} * 2));
    border: $border solid $dark;
    margin: $border;

    border-radius: inherit;
    transition: 0.2s ease;
    margin: $border;

    .theme--light & {
      border-color: $light !important;
    }
    z-index: 2;
  }

  &.is--lg .v-image__image {
    height: calc(100% - (#{$border-lg} * 2));
    width: calc(100% - (#{$border-lg} * 2));
    border: $border-lg solid $dark;
    margin: $border-lg;
  }
}
</style>
