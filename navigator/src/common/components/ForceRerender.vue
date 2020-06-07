<!-- @format -->

<template><div /></template>

<script lang="ts">
import { Component, Vue, Emit, Watch } from 'vue-property-decorator'
import Wrapper from '@/common/components/Wrapper.vue'

@Component({
  computed: {},
  components: {
    Wrapper
  }
})
export default class ForceRerender extends Vue {
  timer: any

  mounted() {
    this.timer = setInterval(() => this.$router.go(-1), 200)
  }

  destroyed() {
    clearInterval(this.timer)
  }
}
</script>
