/** @format */

import { CustomContext } from './custom-context.js'
import { sendLocation } from './send-location.js'
import { onStart } from './on-start.js'
import { onHelp } from './on-help.js'
import { onMessage } from './on-message.js'
import { inlineQuery } from './inline-query.js'
import { giveScene } from './give-scene.js'
import { _redeemWizard } from './redeem-wizard.js'
import { _verifyWizard } from './verify-wizard.js'
import { mainScene } from './main-scene.js'

import { Scene, Markup, Context, Stage } from '../telegraf.js'
import { BotConfig, BotEventHandler } from '../bot.js'

const scenes: typeof Scene[] = [mainScene, giveScene, _verifyWizard, _redeemWizard]
const onHandlers: BotEventHandler[] = []
const cmdHandlers: BotEventHandler[] = []
const actionHandlers: BotEventHandler[] = []
const hearsHandlers: BotEventHandler[] = []

const botid = <string>process.env.BOTID_TEST
const botname = <string>process.env.BOTNAME_TEST
cmdHandlers.push({
  command: 'give',
  handler: (ctx: any) => {
    ctx.scene.enter('giveScene')
  }
})
cmdHandlers.push({
  command: 'redeem',
  handler: (ctx: any) => {
    ctx.scene.enter('redeemWizard')
  }
})
cmdHandlers.push({
  command: 'admin',
  handler: (ctx: any) => {
    const addressLink = 'http://google.com/TODO'
    ctx.reply(
      'Bot Admin',
      Markup.inlineKeyboard([
        Markup.urlButton('Deposit Address: <TODO>', addressLink)
      ]).extra()
    )
  }
})
export const botConfig: BotConfig = {
  dbname: botname,
  botid: botid,
  cmdHandlers,
  onHandlers,
  actionHandlers,
  hearsHandlers,
  scenes,
  onStart,
  onHelp,
  CustomContext,
  inlineQuery,
  sendLocation,
  onMessage
}
