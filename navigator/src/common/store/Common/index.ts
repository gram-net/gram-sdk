/** @format */

import Login, { LoginState } from './Login'
import Help, { HelpState } from './Help'
import Loading, { LoadingState } from './Loading'
import NavBar, { NavBarState } from './NavBar'
import Notifications, { NotificationsState } from './Notifications'
import AudioPlayer, { AudioPlayerState } from './AudioPlayer'
import Utils, { UtilsState } from './Utils'
import Settings, { SettingsState } from './Settings'
import { defineModule } from 'direct-vuex'

export interface CommonState {
  Loading: LoadingState
  NavBar: NavBarState
  Notifications: NotificationsState
  AudioPlayer: AudioPlayerState
  Utils: UtilsState
  Settings: SettingsState
  Help: HelpState
  Login: LoginState
}

const mod = defineModule({
  modules: {
    Loading,
    NavBar,
    Notifications,
    AudioPlayer,
    Utils,
    Settings,
    Help,
    Login
  },
  namespaced: true
})

export default mod
