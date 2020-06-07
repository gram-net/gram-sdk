/** @format */

import { Context, Scene, Markup, BaseScene } from '../telegraf.js'

export const _enterAmount: typeof Scene = new BaseScene('enterAmount')
_enterAmount.enter((ctx: typeof Context) => {
  ctx.reply('Enter an amount in USD. Example: $10')
  ctx.reply(
    'Redeem Menu',
    Markup.keyboard([['Go Back']])
      .resize()
      .extra()
  )
})
// _enterAmount.leave((ctx: typeof Context) => ctx.reply('Bye from enterAmount'))
_enterAmount.on('text', (ctx: typeof Context) => {
  if (ctx.message.text == 'Go Back') {
    ctx.scene.leave()
  } else {
    // TODO: generate share-able token link
    // TODO: Save token record in DB
    ctx.reply('Share this payment token with the receiver:')
    ctx.reply('1234567890+1234567890+1234567890+1234567890=')
    // TODO: output link
    ctx.reply('Send a link to this bot to the receiver:')
    ctx.reply('http://t.me/tfntest1bot')
  }
})
_enterAmount.on('message', (ctx: typeof Context) => {
  ctx.reply('This bot only accepts text messages')
})
