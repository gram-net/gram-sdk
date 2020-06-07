/** @format */

import { telegraf, Stage, session, TelegrafContext } from './telegraf.js'
import { Bot } from './bot.js'
import { botConfig as test } from './test/index.js'
import firebase from 'firebase'

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
const stage = new Stage(botObj.config.scenes) //, { ttl: -1 }
telegramBot.use(session())
telegramBot.use(stage.middleware())

// Register logger middleware
telegramBot.use((ctx: typeof contextType, next: any) => {
  const start = new Date().getTime()
  return next().then(() => {
    const ms: number = new Date().getTime() - start
    console.log('response time %nms', ms)
  })
})

// Login widget events
telegramBot.on('connected_website', (ctx: typeof contextType) =>
  ctx.reply('Website connected')
)

// Telegram passport events
telegramBot.on('passport_data', (ctx: typeof contextType) =>
  ctx.reply('Telegram password connected')
)

telegramBot.help((ctx: typeof contextType) => botObj.config.onHelp(ctx))
telegramBot.on('message', (ctx: typeof contextType, next: any) => {
  botObj.config.onMessage(ctx)
  return next(ctx)
})
telegramBot.action('delete', (ctx: typeof contextType) => ctx.deleteMessage())

for (const h in botObj.config.cmdHandlers) {
  const handler = botObj.config.cmdHandlers[h]
  console.log('set up cmd handler', h, handler)
  telegramBot.command(handler.command, <typeof TelegrafContext>handler.handler)
}
for (const h in botObj.config.onHandlers) {
  const handler = botObj.config.onHandlers[h]
  console.log('set up on handler', h, handler)
  telegramBot.on(handler.command, <typeof TelegrafContext>handler.handler)
}
for (const a in botObj.config.actionHandlers) {
  const handler = botObj.config.actionHandlers[a]
  console.log('set up on handler', a, handler)
  telegramBot.action(handler.command, <typeof TelegrafContext>handler.handler)
}
telegramBot.start((ctx: typeof contextType) => botObj.config.onStart(ctx))
telegramBot.launch()
console.log('----\n' + botname + ' Launched')
telegramBot.startPolling(5, 100, ['message'], () => {
  console.error('BOT STOPPED POLLING')
})
console.log('----\n' + botname + ' Started Polling...')
