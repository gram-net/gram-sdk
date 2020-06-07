/** @format */

import { Context } from '../telegraf.js'
export const onHelp = async function (ctx: typeof Context): Promise<void> {
  const commands = await ctx.getMyCommands()
  const info = commands.reduce(
    (acc: any, val: any) => `${acc}/${val.command} - ${val.description}\n`,
    ''
  )
  ctx.reply(info)
}
