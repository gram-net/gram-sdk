<!-- @format -->

<template>
  <div class="text-center">
    <v-text-field
      v-model="pin"
      class="type--large password"
      solo
      placeholder="------"
      type="password"
      readonly
    />

    <div class="keyboard">
      <v-row>
        <v-col v-for="i of [1, 2, 3]" :key="i">
          <v-btn :ref="'key-' + i" text large fab @click="enter(i)">
            {{ i }}
          </v-btn>
        </v-col>
      </v-row>
      <v-row>
        <v-col v-for="i of [4, 5, 6]" :key="i">
          <v-btn :ref="'key-' + i" text large fab @click="enter(i)">
            {{ i }}
          </v-btn>
        </v-col>
      </v-row>
      <v-row>
        <v-col v-for="i of [7, 8, 9]" :key="i">
          <v-btn :ref="'key-' + i" text large fab @click="enter(i)">
            {{ i }}
          </v-btn>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          &nbsp;
        </v-col>
        <v-col>
          <v-btn :ref="'key-' + 0" text large fab @click="enter(0)">
            0
          </v-btn>
        </v-col>
        <v-col>
          <v-btn :ref="'backspace'" text large fab class="backspace" @click="backspace()">
            <v-icon>backspace</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Emit, Watch, Prop } from 'vue-property-decorator'

@Component({})
export default class PinPad extends Vue {
  @Prop({ default: '' }) value!: string

  get pin() {
    return this.value
  }
  set pin(pin: string) {
    this.$emit('input', pin)
    if (pin.length === 6 && pin !== this.value) this.$emit('submit', pin)
  }

  enter(value: number) {
    if (this.pin.length === 6) return
    this.pin += value
  }

  backspace() {
    this.pin = this.pin.substr(0, this.pin.length - 1)
  }

  mounted() {
    document.addEventListener('keydown', this.keydown)
  }

  destroyed() {
    document.removeEventListener('keydown', this.keydown)
  }

  keydown(e) {
    const focus = (ref: any) => {
      try {
        const refs = this.$refs as any
        const el = () => (refs[ref] && refs[ref].$el ? refs[ref].$el : refs[ref][0].$el)
        setTimeout(() => el().focus(), 50)
        setTimeout(() => el().blur(), 200)
      } catch {
        //  nothing
      }
    }

    if (e.code === 'Backspace') {
      this.backspace()
      focus('backspace')
    } else if (['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(e.key)) {
      this.enter(+e.key)
      focus('key-' + e.key)
    }
  }
}
</script>

<style>
.password input {
  letter-spacing: 9px;
  padding: 0.75rem 0.5rem;
  margin: auto;
  text-align: center;
}
</style>

<style lang="scss" scoped>
.password {
  margin: 2rem auto 0rem;
  max-width: 300px;

  input {
    letter-spacing: 5px;
  }
}
.keyboard {
  $bleed: 10px;
  width: calc(105%);
  margin: 0 -$bleed;
  padding: $bleed $bleed;

  .v-btn {
    font-size: 18px;
    margin: -0.35rem 0;

    &.backspace .v-icon {
      font-size: 20px;
    }
  }
}
</style>
