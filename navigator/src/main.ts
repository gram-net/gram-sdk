/** @format */

import './common/styles/app.scss'
import VuetifyDialog from 'vuetify-dialog'
import 'vuetify-dialog/dist/vuetify-dialog.css'
import vuedl from 'vuedl'
import Vuetify from 'vuetify'
import { vuetifyOptions } from './vuetify'
import Vue2Filters from 'vue2-filters'
import { Component, Vue } from 'vue-property-decorator'
import VuetifyConfirm from 'vuetify-confirm'

import _get from 'lodash/get'
import App from './App.vue'
import store from './common/store'
import router from './router'
import PortalVue from 'portal-vue'
import { Help } from './common/directives/help'
import VueTheMask from 'vue-the-mask'

window.Vue = Vue as any

export const vuetify = new Vuetify(vuetifyOptions)

Vue.prototype.$get = _get

Vue.use(VuetifyDialog, {
  context: {
    vuetify
  }
})

Vue.use(VueTheMask)
Vue.use(Vue2Filters)
Vue.use(PortalVue)
Vue.use(Vuetify)
Vue.use(VuetifyConfirm, { vuetify, color: 'error', title: 'Are you sure?' })
Vue.directive('help', Help)

@Component({
  store: store.original,
  router,
  vuetify,
  render: (h) => h(App)
})
export default class RootComponent extends Vue {
  // async mounted() {}
}

const el = new RootComponent().$mount().$el

export const confirm = Vue.prototype.$confirm as Vue['$confirm']
export const dialog = Vue.prototype.$dialog as Vue['$dialog']
;(document.getElementById('app') as HTMLElement).appendChild(el)
