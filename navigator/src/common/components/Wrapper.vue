<!-- @format -->

<template>
  <v-container py-4>
    <v-layout justify-center align-center>
      <v-flex>
        <div class="mt-3 pl-3 pr-3">
          <slot />
        </div>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script lang="ts">
import { Component, Prop, Vue, Emit } from 'vue-property-decorator'

@Component({})
export default class Wrapper extends Vue {}
</script>
