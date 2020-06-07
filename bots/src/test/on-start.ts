/** @format */

import { Context } from '../telegraf.js'
export const onStart = (ctx: typeof Context): void => {
  ctx.reply(`Deep link payload: ${ctx.startPayload}`)
}
