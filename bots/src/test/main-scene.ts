/** @format */

import { Context, Scene, Markup, BaseScene } from '../telegraf.js'

export const mainScene: typeof Scene = new BaseScene('mainScene')

const onEnter = (ctx: typeof Context) => {
  ctx.reply(
    '☝☝☝☝☝☝ 🎁🎁🎁\n\nWelcome to Hari Raya Bot.\n\nSelect an option from the button menu.',
    Markup.keyboard([['Redeem a Gift', 'Admin']])
      .resize()
      .extra()
  )
}
mainScene.enter(onEnter)
// mainScene.leave((ctx: typeof Context) => {
//   ctx.reply('exiting enterSig scene')
// })
mainScene.on('text', async (ctx: typeof Context) => {
  if (ctx.message.text == 'Admin') {
    // await ctx.reply('Give a Gift: Loading...')
    ctx.scene.enter('giveScene')
  } else if (ctx.message.text == 'Redeem a Gift') {
    // await ctx.reply('Redeem a Gift: Loading...')
    ctx.scene.enter('redeemWizard')
  } else {
    onEnter(ctx)
  }
})
