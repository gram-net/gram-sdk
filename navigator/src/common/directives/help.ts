/** @format */

import store from '@/common/store'
import { DirectiveOptions } from 'vue/types/umd'

export const Help: DirectiveOptions = {
  bind(el, binding, vnode) {
    const { state, getters } = store
    const { value } = binding
    el.setAttribute('data-help', value)

    const updateActiveState = () => {
      const step = getters.Common.Help.activeHelpStep
      const isActive = step.name === value
      el.setAttribute('data-help-active', isActive + '')
    }

    updateActiveState()

    store.original.subscribe((event) => {
      if (event.type === 'Common/Help/setActiveIndex') {
        updateActiveState()
      }
    })
  }
}
