/** @format */

import { CustomContext } from './custom-context.js'
import { sendLocation } from './send-location.js'
import { onStart } from './on-start.js'
import { onHelp } from './on-help.js'
import { onMessage } from './on-message.js'
import { inlineQuery } from './inline-query.js'
import { _giveWizard } from './give-wizard.js'
import { _redeemWizard } from './redeem-wizard.js'
import { _verifyWizard } from './verify-wizard.js'

import { Extra, Context, Scene, Markup } from '../telegraf.js'
import { BotConfig, BotEventHandler } from '../bot.js'

const scenes: typeof Scene[] = [_giveWizard, _redeemWizard]
const onHandlers: BotEventHandler[] = []
const cmdHandlers: BotEventHandler[] = []
const actionHandlers: BotEventHandler[] = []

const botid = 'tfntestbot1'
const botname = 'test'

actionHandlers.push({
  command: 'special',
  handler: (ctx: typeof Context) => {
    return ctx.reply(
      'Special buttons keyboard',
      Extra.markup((markup: any) => {
        return markup
          .resize()
          .keyboard([
            markup.contactRequestButton('Send contact'),
            markup.locationRequestButton('Send location')
          ])
      })
    )
  }
})

actionHandlers.push({
  command: 'italic',
  handler: async (ctx: typeof Context, next: any) => {
    try {
      await ctx.answerCbQuery()
      await ctx.editMessageCaption(
        '_Caption_',
        Extra.markdown().markup(
          Markup.inlineKeyboard([
            Markup.callbackButton('Plain', 'plain'),
            Markup.callbackButton('* Italic *', 'italic')
          ])
        )
      )
    } catch (e) {
      console.error(e)
    }
    return ctx.reply('👍').then(() => next())
  }
})
cmdHandlers.push({
  command: 'give',
  handler: (ctx: typeof Context) => {
    // TODO: authenticate user
    ctx.scene.enter('giveWizard')
  }
})

// TODO: check balance command

// TODO: deposit command

cmdHandlers.push({
  command: 'redeem',
  handler: (ctx: typeof Context) => {
    // check DB for records on this user
    ctx.scene.enter('redeemWizard')
  }
})

onHandlers.push({
  command: 'message',
  handler: (ctx: typeof Context) => {
    // TODO: check DB status of the user
    ctx.reply(
      'Select /redeem or /give',
      Markup.keyboard(['/redeem', '/give']).resize().extra()
    )
    return ctx.replyWithPhoto(
      { url: 'https://picsum.photos/200/300/?random' },
      Extra.load({ caption: 'Caption' })
        .markdown()
        .markup((m: any) =>
          m.inlineKeyboard([
            m.callbackButton('Plain', 'plain'),
            m.callbackButton('Italic', 'italic')
          ])
        )
    )
  }
})

export const botConfig: BotConfig = {
  dbname: botname,
  botid: botid,
  cmdHandlers,
  onHandlers,
  actionHandlers,
  scenes,
  onStart,
  onHelp,
  CustomContext,
  inlineQuery,
  sendLocation,
  onMessage
}
