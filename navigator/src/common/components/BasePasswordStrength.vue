<!-- @format -->

<template>
  <div class="password-score" :data-score="score">
    <div
      v-for="(score, i) of scores"
      :key="i"
      :class="getClass(i)"
      class="password-score__bar"
    >
      {{ score }}
    </div>
  </div>
</template>

<script lang="ts">
import { Prop, Vue, Emit, Component } from 'vue-property-decorator'

@Component({})
export default class BasePasswordStrength extends Vue {
  private scores = new Array(4)
  @Prop({ type: Number, default: 0 }) score!: number
  @Prop({ type: Boolean, default: false }) disabled!: boolean

  getClass(i: number) {
    if (this.disabled) {
      return ''
    } else if (this.score <= 1 && i <= 0) {
      return 'error'
    } else if (this.score === 2 && i <= 1) {
      return 'warning'
    } else if (this.score === 3 && i <= 2) {
      return 'yellow'
    } else if (this.score > 3) {
      return 'success'
    }
  }
}
</script>

<style lang="scss">
.password-score {
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: space-between;

  & > div {
    width: calc((100% / 4) - 2px);
    border-radius: 5px;
    background: rgba(white, 0.2);
    height: 3px;
  }
}
</style>
