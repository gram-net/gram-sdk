/** @format */
import firebase from 'firebase-admin'
export type BotTokens = {
  telegram: string
  firebase: {
    apiKey: string
    authDomain: string
    databaseUrl: string
    projectId: string
    storageBucket: string
    messagingSenderId: string
    appId: string
    credential: any
  }
  mnemonic: string
}
import { configData } from './firebase-credentials.js'
export const tokensObj = {
  test: {
    telegram: process.env.TOKEN_TEST,
    firebase: {
      credential: firebase.credential.cert(<any>configData),
      databaseURL: 'https://' + process.env.FIRE_APPID_TEST + '.firebaseio.com'
    },
    mnemonic: process.env.MN_TEST
  }
}
