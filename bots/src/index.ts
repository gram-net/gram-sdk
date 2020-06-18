/** @format */

import { telegraf, Stage, session, Context } from './telegraf.js'
import { Bot } from './bot.js'
import { botConfig as test } from './test/index.js'
import firebase from 'firebase-admin'

const bots: any = { test }
const botname: string = process.argv.slice(2).toString()
console.warn('Attempting to start bot: ' + botname)

if (!bots[botname]) {
  throw new Error('Bot not found. Usage: yarn $botname, test/giver/verify')
}
const botObj: Bot = new Bot(botname, bots[botname])
firebase.initializeApp(botObj.tokens.firebase)
const db = firebase.database()
console.log('---\nStarting bot: ' + botname)
const contextType = botObj.config.CustomContext
const telegramBot = new telegraf(botObj.tokens.telegram, <any>{ contextType })
const stage = new Stage(botObj.config.scenes, { default: 'mainScene' }) //, { ttl: -1 }
telegramBot.use((ctx: typeof contextType, next: any) => {
  const start = new Date().getTime()
  ctx.db = db
  ctx.botObj = botObj
  return next().then(() => {
    const ms: number = new Date().getTime() - start
    console.log('response time %nms', ms)
  })
})
telegramBot.use(session())
telegramBot.catch((err: any, ctx: typeof Context) => {
  console.log(`Ooops, encountered an error for ${ctx.updateType}`, err)
})
telegramBot.help((ctx: typeof contextType) => botObj.config.onHelp(ctx))
telegramBot.start((ctx: typeof contextType) => botObj.config.onStart(ctx))
telegramBot.use(stage.middleware())
telegramBot.launch()
console.log('----\n' + botname + ' Launched')
telegramBot.startPolling(1, 100, ['message'], () => {
  console.error('BOT STOPPED POLLING')
})
console.log('----\n' + botname + ' Started Polling...')
