/** @format */

import { Context, Scene, Markup, BaseScene } from '../telegraf.js'

export const _enterSig: typeof Scene = new BaseScene('enterSig')
_enterSig.enter((ctx: typeof Context) => {
  ctx.reply('Enter your payment signature. Example:')
  ctx.reply('23d823sd9239jojs9023o20djkjfhi3498dfih9887yhu41h01n=')
  ctx.reply(
    'Redeem Gift',
    Markup.keyboard([['Go Back']])
      .resize()
      .extra()
  )
})
// _enterSig.leave((ctx: typeof Context) => {
//   ctx.reply('exiting enterSig scene')
// })
_enterSig.on('text', (ctx: typeof Context) => {
  if (ctx.message.text == 'Go Back') {
    ctx.scene.leave()
  } else {
    // TODO: check token against database
    // TODO: check balance
    ctx.session.sig = ctx.message
    ctx.session.chatid = ctx.chat.id
    ctx.session.tid = ctx.from.id
    ctx.scene.enter('enterMessage')
  }
})
_enterSig.on('message', (ctx: typeof Context) => {
  ctx.reply('This bot only accepts text messages')
})
