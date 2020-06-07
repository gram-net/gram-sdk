<!-- @format -->

<template>
  <v-form ref="form" v-model="formModel" class="pa-4" @submit="submit">
    <v-text-field v-model.number="form.id" label="ID" type="number" :rules="IDRules" />
    <v-text-field v-model="form.name" label="Name" :rules="nameRules" />
    <v-text-field v-model="form.RPCURL" label="RPC URL" :rules="RPCURLRules" />
    <v-text-field v-model.number="form.chainID" label="Chain ID" type="number" />
    <v-text-field v-model="form.symbol" label="Symbol" />
    <v-text-field v-model="form.blockExplorerURL" label="Block Explorer URL" />
    <v-btn block large type="submit">
      Add Network
    </v-btn>
  </v-form>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { Network } from '@/common/models/network'
import { makeid } from '@/common/lib/makeid'
import { notify } from '@/common/store'
import { symbol } from '../../../lib/constants'

@Component({})
export default class AddNetwork extends Vue {
  formModel = true
  defaultForm: Network = {
    id: 13371337,
    name: 'GRAM',
    RPCURL: 'https://thegram.org',
    chainID: -1,
    symbol: symbol,
    blockExplorerURL: 'https://thegram.network/explorer',
    removable: true
  }
  form: Network = { ...this.defaultForm }
  $refs!: {
    form: any
  }

  IDRUles = [(v) => !!v || 'ID is required']
  RPCURLRules = [(v) => !!v || 'RPC URL is required']
  nameRules = [(v) => !!v || 'Name is required']

  submit() {
    this.$refs.form.validate()
    if (!this.formModel)
      return notify({
        text: 'Please fill out all required fields',
        type: 'error',
        duration: 4000
      })
    this.$emit('submit', this.form)
    this.form = { ...this.defaultForm }
  }
}
</script>

<style lang="scss" scoped></style>
