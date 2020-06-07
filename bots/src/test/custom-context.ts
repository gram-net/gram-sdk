/** @format */

import { Context } from '../telegraf.js'

export class CustomContext extends Context {
  constructor(update: never, telegram: never, options: never) {
    console.log('Creating context for %j', update)
    super(update, telegram, options)
  }
  reply(...args: any): void {
    console.log('reply called with args: %j', args)
    return super.reply(...args)
  }
}
