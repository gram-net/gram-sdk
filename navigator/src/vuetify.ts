/** @format */

// import Vue from "vue";
import colors from 'vuetify/lib/util/colors'

// import Vuetify, {
//   VFlex,
//   VLayout,
//   VAlert,
//   VToolbar,
//   VContent,
//   VContainer,
//   VList,
//   VListItem,
//   VListItemContent,
//   VListItemTitle,
//   VListItemAction,
//   VListItemActionText,
//   VListItemAvatar,
//   VCard,
//   VCardTitle,
//   VCardText,
//   VApp,
//   VAppBar,
//   VProgressCircular,
//   VSpacer,
//   VTextField,
//   VIcon,
//   VBtn,
//   VDivider,
//   VSubheader,
//   VToolbarTitle,
//   VDialog,
//   VTooltip,
//   VCardActions,
//   VBtnToggle,
//   VSheet,
//   VRadioGroup,
//   VRadio
// } from "vuetify/lib";
// import { Ripple } from "vuetify/lib/directives";

// export const vuetifyPlugin = {};

// export const vuetifyPlugin1 = {
//   components: {
//     VFlex,
//     VLayout,
//     VAlert,
//     VToolbar,
//     VToolbarTitle,
//     VContent,
//     VContainer,
//     VList,
//     VListItem,
//     VListItemContent,
//     VListItemTitle,
//     VListItemAvatar,
//     VListItemAction,
//     VListItemActionText,
//     VCard,
//     VCardTitle,
//     VCardText,
//     VApp,
//     VAppBar,
//     VProgressCircular,
//     VSpacer,
//     VTextField,
//     VIcon,
//     VBtn,
//     VDivider,
//     VSubheader,
//     VDialog,
//     VTooltip,
//     VCardActions,
//     VBtnToggle,
//     VSheet,
//     VRadioGroup,
//     VRadio
//   },
//   directives: {
//     Ripple
//   }
// };

const primary = '#00b4e8'
const secondary = '#9475BC'
const accent = '#EDC036'
const success = '#3fb34f'
const error = '#ff5a5f'

export const themeColors = {
  primary,
  secondary,
  blue: primary,
  purple: secondary,
  accent,
  yellow: accent,
  success,
  green: success,
  error,
  red: error,
  info: primary,
  warning: accent
}

export const vuetifyOptions = {
  icons: {
    iconfont: 'mdiSvg' as any // 'mdi' || 'mdiSvg' || 'md' || 'fa' || 'fa4'
  },
  theme: {
    customProperties: true,
    cspNonce: 'dQw4w9WgXcQ',
    minifyTheme: (css) =>
      process.env.NODE_ENV === 'production' ? css.replace(/[\s|\r\n|\r|\n]/g, '') : css,
    dark: JSON.parse(localStorage.getItem('darkMode') || 'true'),
    // https://vuetifyjs.com/en/customization/theme
    themes: {
      light: {
        ...themeColors
      },
      dark: {
        ...themeColors
      }
    }
  }
}
