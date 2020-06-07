<!-- @format -->

<template>
  <v-list-item class="px-0 image-upload">
    <v-list-item-avatar
      v-if="!fileOnly"
      class="clickable mr-2"
      @click="$refs.input.click()"
    >
      <v-img v-if="fileBase64 && !loading" :lazy-src="fileBase64" alt="Image Upload" />
      <v-avatar v-else color="grey">
        <v-progress-circular
          v-if="loading || base64Loading"
          width="2"
          size="24"
          color="white"
          indeterminate
        />
        <v-icon v-else color="white" small v-text="icon" />
      </v-avatar>
    </v-list-item-avatar>

    <v-list-item-content>
      <v-list-item-title style="overflow: initial;">
        <v-btn
          :loading="loading || base64Loading"
          :disabled="disabled"
          type="button"
          :color="color"
          @click="$refs.input.click()"
        >
          <span v-if="fileBase64 && showFileName" class="image-upload__filename">{{
            file.name
          }}</span>
          <template v-if="!showFileName || (!fileBase64 && showFileName)">
            {{ text }}
          </template>
          <v-icon v-if="fileBase64" right @click.stop="reset" v-text="'close'" />
        </v-btn>
      </v-list-item-title>
    </v-list-item-content>

    <input ref="input" type="file" hidden :accept="accept" @change="fileChange" />
  </v-list-item>
</template>

<script lang="ts">
import { Component, Vue, Emit, Watch, Prop } from 'vue-property-decorator'
import { handleError } from '../lib/error-handling'
import { getBase64, base64ToFile, downsampleBase64 } from '../lib/get-base64'

export interface HTMLFileInputEvent extends HTMLInputElement {
  target: {
    files?: File[]
  }
}

@Component({})
export default class ImageUpload extends Vue {
  @Prop({ default: 'primary' }) color!: string
  @Prop({ default: false }) disabled!: boolean
  @Prop({ default: 'Select Image' }) text!: string
  @Prop({ default: true }) showFileName!: boolean
  @Prop({ default: false }) loading!: boolean
  @Prop({ default: 'photo' }) icon!: string
  @Prop({ default: false }) fileOnly!: boolean
  @Prop({ default: 'image/jpeg, image/png' }) accept!: string

  private fileBase64: null | string = null
  private base64Loading = false

  $refs!: {
    input: HTMLInputElement
  }

  get file() {
    const { input } = this.$refs
    return input && input.value && input.files && input.files[0]
  }

  public reset() {
    this.fileBase64 = null
    this.base64Loading = false
    this.$refs.input.value = ''
    // this.$emit("fileChange", null);
    // this.$emit("base64Change", null);
    this.$emit('reset')
  }

  async fileChange(event: HTMLFileInputEvent) {
    const file = event.target.files && event.target.files[0]
    if (file) {
      this.$emit('fileChange', file)
      this.base64Loading = true
      try {
        this.fileBase64 = (await getBase64(file)) as string
        this.$emit('base64Change', this.fileBase64)
      } catch (error) {
        handleError(error, "Couldn't get image", 4000)
      } finally {
        this.base64Loading = false
      }
    } else {
      this.$emit('base64Change', null)
      this.$emit('fileChange', null)
    }
  }
}
</script>

<style>
.image-upload__filename {
  max-width: 250px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
