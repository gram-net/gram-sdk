/** @format */

import { Context, Scene, Markup, BaseScene } from '../telegraf.js'

export const _enterMessage: typeof Scene = new BaseScene('enterMessage')

_enterMessage.enter((ctx: typeof Context) => {
  ctx.reply('What is your wish for your friend? Write a note; Example:')
  ctx.reply('Dear friend, I wish you peace and riches in this life and in paradise.')
  ctx.reply(
    'Redeem Menu',
    Markup.keyboard([['Go Back']])
      .resize()
      .extra()
  )
})
_enterMessage.leave((ctx: typeof Context) => {
  ctx.reply('Exiting redeem mode...')
})
_enterMessage.on('text', (ctx: typeof Context) => {
  if (ctx.message.text == 'Go Back') {
    ctx.scene.leave()
  } else {
    // TODO: update DB record
    ctx.scene.enter('redeem')
  }
})
_enterMessage.on('message', (ctx: typeof Context) => {
  ctx.reply('This bot only accepts text messages')
})
