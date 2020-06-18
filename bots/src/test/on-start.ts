/** @format */

import { Context, Stage } from '../telegraf.js'
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const onStart = (ctx: typeof Context): void => {
  ctx.reply('Send any text message to start.')
}
