<!-- @format -->

<template>
  <section name="page-winners">
    <h1 class="page-title">
      Winners
    </h1>

    <router-link
      v-for="ticket of winners"
      :key="ticket.id"
      :name="'winner-' + ticket.id"
      :to="`winners/${ticket.id}`"
    >
      <Ticket :ticket="ticket" />
    </router-link>
  </section>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { Ticket as TicketModel } from '../models/ticket'
import Ticket from '../components/Ticket.vue'
import * as format from '@/common/lib/format'
import { mapState } from 'vuex'
import { RootState } from '@/common/store'

@Component({
  filters: {
    ...format
  },
  components: {
    Ticket
  },
  computed: {
    ...mapState<RootState>({
      winners: ({ Lotton }) => Lotton.winners
    })
  }
})
export default class Winners extends Vue {
  winners!: Ticket[]

  async mounted() {
    const { state, commit, dispatch } = this.$store
    await dispatch('Lotton/getWinners')
  }

  // destroyed() {}
}
</script>
