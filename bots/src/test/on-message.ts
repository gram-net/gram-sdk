/** @format */

import { Extra, Markup, Context } from '../telegraf.js'
export const onMessage = function (ctx: typeof Context): void {
  const keyboard = Markup.inlineKeyboard([
    Markup.urlButton('❤️', 'http://thegram.org'),
    Markup.callbackButton('Bold', 'bold'),
    Markup.callbackButton('Delete', 'delete'),
    Markup.callbackButton('Italic', 'italic')
  ])
  ctx.telegram.sendCopy(ctx.chat.id, ctx.message, Extra.markup(keyboard))
}
