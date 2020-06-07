/** @format */

import { Context, Scene, Markup, BaseScene } from '../telegraf.js'

export const _enterAddress: typeof Scene = new BaseScene('enterAddress_enterAddress')

_enterAddress.enter((ctx: typeof Context) => {
  ctx.reply('Enter your USDT Address to receive your USDT.')
  ctx.reply(
    'Download Exodus Wallet from the iOS/Google app store to create a USDT wallet'
  )
  ctx.reply(
    'Redeem Menu',
    Markup.keyboard([['Go Back']])
      .resize()
      .extra()
  )
})
_enterAddress.leave((ctx: typeof Context) => {
  ctx.reply('Thank you! Goodbye!')
})
_enterAddress.on('text', (ctx: typeof Context) => {
  if (ctx.message.text == 'Go Back') {
    ctx.scene.leave()
  } else {
    // TODO: send money
    // TODO: update DB record
  }
})
_enterAddress.on('message', (ctx: typeof Context) => {
  ctx.reply('This bot only accepts text messages')
})
