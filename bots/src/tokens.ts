/** @format */

export type BotTokens = {
  telegram: string
  firebase: {
    apiKey: string
    authDomain: string
    databaseUrl: string
  }
  mnemonic: string
}
export const tokensObj = {
  test: {
    telegram: process.env.BOT_TOKEN_TEST,
    firebase: {
      apiKey: process.env.FIRE_API_BOTTEST,
      authDomain: process.env.FIRE_APPID_BOTTEST + '.firebaseapp.com',
      databaseURL: 'https://' + process.env.FIRE_APPID_BOTTEST + '.firebaseio.com'
    },
    mnemonic: process.env.MN_TEST
  }
}
