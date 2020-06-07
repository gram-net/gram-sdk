<!-- @format -->

<template>
  <div ref="slider" class="swipe-btn" :class="sliderClass" :data-loading="loading">
    <button ref="submitButton" type="submit" class="d-none" />

    <div
      ref="slideButton"
      class="swipe-btn__fab"
      :style="[slideButtonStyle]"
      @mousedown="startSwipe"
      @mousemove="continueSwipe"
      @mouseup="endSwipe"
      @touchstart="startSwipe"
      @touchmove="continueSwipe"
      @touchend="endSwipe"
    >
      <v-btn
        fab
        :color="
          loading
            ? loadingColor
            : error
            ? errorColor
            : completed
            ? completedColor
            : initialColor
        "
      >
        <v-icon
          v-if="!loading"
          v-text="error ? errorIcon : completed ? completedIcon : initialIcon"
        />
        <v-progress-circular v-else :size="30" indeterminate color="yellow" />
      </v-btn>
    </div>

    <div class="swipe-btn__background" :class="'elevation-' + elevation">
      <div ref="overlay" class="swipe-btn__background__overlay" :style="[overlayStyle]" />
    </div>

    <div
      class="swipe-btn__text"
      v-text="loading ? loadingText : error ? errorText : instructionText"
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Emit } from 'vue-property-decorator'
import _get from 'lodash/get'

@Component({
  components: {}
})
export default class SwipeBtn extends Vue {
  // Fork of https://github.com/tran2/vue-swipe-button/blob/master/src/SwipeButton.vue
  // With many improvements. Used it for basic swiping code...

  $refs!: {
    slider: HTMLElement
    slideButton: HTMLElement
    overlay: HTMLElement
    submitButton: HTMLButtonElement
  }

  @Prop({ type: String, default: 'Swipe to continue' }) initialText!: string
  @Prop({ type: String, default: 'Success!' }) completedText!: string
  @Prop({ type: String, default: 'Loading…' }) loadingText!: string
  @Prop({ type: String, default: 'primary' }) initialColor!: string
  @Prop({ type: String, default: 'success' }) completedColor!: string
  @Prop({ type: String, default: 'error' }) errorColor!: string
  @Prop({ type: String, default: 'Complete all fields' }) errorText!: string
  @Prop({ type: String, default: 'grey' }) loadingColor!: string
  @Prop({ type: String, default: 'check' }) initialIcon!: string
  @Prop({ type: String, default: 'check' }) completedIcon!: string
  @Prop({ type: String, default: 'warning' }) errorIcon!: string
  @Prop({ type: String, default: '3' }) elevation!: string | number
  @Prop({ type: Boolean, default: false }) loading!: boolean
  @Prop({ type: Boolean, default: false }) error!: boolean

  private initialMouseX = 0
  private currentMouseX = 0
  private startDrag = false
  private endPoint = 500
  private initialSliderWidth = 0
  private initialSlideButtonPosition = 0
  private instructionText = this.initialText
  private slideButtonStyle = { left: '0px' }
  private overlayStyle = { width: this.getButtonWidth() / 2 + 'px' }
  private sliderClass = ''
  private completed = false

  startSwipe(event) {
    if (this.completed) return
    // this will be used to calculate the offset to increase the width
    // of the slider
    this.initialMouseX = this.getMouseXPosFromEvent(event)
    // once our slider's x button position >= slider - button's width,
    // the action is confirmed
    this.endPoint = this.getEndingPoint()
    this.calculateSliderInitialWidth()
    this.calculateSlideButtonInitialPosition()
    this.updateSlideButton(0)
    this.updateSlider(0)
    this.startDrag = true
    // for transition animation
    this.sliderClass = 'has--started'
  }

  getEndingPoint() {
    if (!this.$refs.slider) return 0
    const clientRects = this.$refs.slider.getClientRects()[0]
    return clientRects.right
  }

  calculateSliderInitialWidth() {
    if (!this.$refs.slider) return (this.initialSliderWidth = 0)
    const sliderLeftPos = this.$refs.slider.getClientRects()[0]['x']
    this.initialSliderWidth = this.initialMouseX - sliderLeftPos
    if (this.initialSliderWidth < 0) {
      this.initialSliderWidth = 0
    }
  }

  calculateSlideButtonInitialPosition() {
    if (!this.$refs.slider) return 0
    this.initialSlideButtonPosition = this.$refs.slider.getClientRects()[0]['x']
  }

  continueSwipe(event) {
    if (!this.startDrag) return
    this.currentMouseX = this.getMouseXPosFromEvent(event)
    const delta = this.currentMouseX - this.initialMouseX
    this.updateSlider(delta)
    this.updateSlideButton(delta)
    if (this.sliderReachedEndPoint()) this.endSwipe()
  }

  endSwipe() {
    this.startDrag = false
    if (this.sliderReachedEndPoint()) {
      this.sliderClass = 'has--completed'
      this.actionConfirmed()
    } else {
      this.sliderClass = ''
      this.slideButtonStyle.left = '0px'
      this.overlayStyle.width = this.getButtonWidth() / 2 + 'px'
    }
  }

  getMouseXPosFromEvent(event) {
    return event.clientX || _get(event, 'touches[0].pageX') || 0
  }

  updateSlider(delta) {
    const sliderWidth = this.getSliderWidth()
    let newWidth = this.initialSliderWidth + delta
    // prevent overflow
    if (newWidth > sliderWidth) newWidth = sliderWidth
  }

  getSliderWidth() {
    if (!this.$refs.slider) return 0
    return this.$refs.slider.getClientRects()[0].width
  }

  updateSlideButton(delta) {
    if (delta < 0) return
    this.slideButtonStyle.left = `${delta}px`
    this.overlayStyle.width = `${delta + this.getButtonWidth() / 2}px`
    // prevent overflow
    if (this.sliderReachedEndPoint()) {
      const buttonLeftPos = this.getSliderWidth() - this.getButtonWidth()
      this.slideButtonStyle.left = `${buttonLeftPos}px`
      this.overlayStyle.width = `${buttonLeftPos + this.getButtonWidth() / 2}px`
    }
  }

  getButtonWidth() {
    if (!this.$refs.slideButton) return 0
    const slideButtonRect = this.$refs.slideButton.getClientRects()[0]
    return slideButtonRect.width
  }

  sliderReachedEndPoint() {
    if (!this.$refs.slideButton) return false
    const slideButtonRect = this.$refs.slideButton.getClientRects()[0]
    return slideButtonRect.right >= this.endPoint
  }

  actionConfirmed() {
    // ensure the event is only fire once
    if (!this.completed) {
      this.completed = true
      this.instructionText = this.error ? this.errorText : this.completedText
      this.$emit('confirm')
      setTimeout(this.reset, 1000)
    }
  }
  reset() {
    this.completed = false
    this.instructionText = this.initialText
    this.sliderClass = ''
    this.updateSlider(0)
    this.updateSlideButton(0)
    this.slideButtonStyle.left = '0px'
    this.overlayStyle.width = this.getButtonWidth() / 2 + 'px'
  }
  mounted() {
    document.addEventListener('mousemove', this.continueSwipe)
    document.addEventListener('mouseup', this.endSwipe)
  }
  destroyed() {
    document.removeEventListener('mousemove', this.continueSwipe)
    document.removeEventListener('mouseup', this.endSwipe)
  }

  submit() {
    this.$refs.submitButton.click()
  }
}
</script>

<style lang="scss" scoped>
$size: 54px;
@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}
@mixin nonselect {
  user-select: none;
  cursor: default;
}

.swipe-btn {
  position: relative;
  height: $size;
  @include flex-center;
  @include nonselect;
  margin-left: -60px;
  margin-right: -60px;

  &[data-loading] {
    pointer-events: none;
  }

  &__background__overlay,
  &__fab {
    .has--started & {
      transition: none;
    }
  }

  &__fab {
    transition: 0.5s ease;
    position: absolute;
    z-index: 5;
    @include flex-center;
  }

  &__text {
    @include nonselect;
    text-transform: uppercase;
    font-size: 13px;
    @media screen and (max-width: 600px) {
      font-size: 13px;
    }
    font-weight: 500;
    letter-spacing: 1.125px;
    position: relative;
    z-index: 2;
  }

  &__background {
    $size: $size - 0;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    right: 0;
    left: 0;
    height: $size;
    border-radius: $size / 2;
    overflow: hidden;
    background: rgba(white, 0.09);

    .v-application.theme--light & {
      background: white;
    }

    &__overlay {
      /* this defines the return animation when user touchout */
      transition: 0.5s ease;
      position: absolute;
      left: 0px;
      width: 100px;
      height: $size;
      @include flex-center;
      @include nonselect;
      background: rgba(white, 0.1);

      .v-application.theme--light & {
        background: rgba(black, 0.1);
      }
    }
  }
}
</style>
