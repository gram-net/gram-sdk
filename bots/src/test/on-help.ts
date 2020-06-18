/** @format */

import { Context } from '../telegraf.js'
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const onHelp = async function (ctx: typeof Context): Promise<void> {
  const commands = await ctx.getMyCommands()
  const info = commands.reduce(
    (acc: any, val: any) => `${acc}/${val.command} - ${val.description}\n`,
    'Enter /give, /redeem, or /admin, or select from the button menu'
  )
  ctx.reply(info)
}
