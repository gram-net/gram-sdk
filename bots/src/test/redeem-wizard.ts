/** @format */

import { WizardScene, Composer, Context, Scene } from '../telegraf.js'

import { _enterAddress } from './enter-address.js'
import { _enterSig } from './enter-sig.js'
import { _enterMessage } from './enter-message.js'
import { _verifyWizard } from './verify-wizard.js'

const stepHandler = new Composer()
stepHandler.action('next', (ctx: typeof Context) => {
  ctx.reply('Step 2. Via inline button')
  return ctx.wizard.next()
})
stepHandler.command('next', (ctx: typeof Context) => {
  ctx.reply('Step 2. Via command')
  return ctx.wizard.next()
})
stepHandler.use((ctx: typeof Context) =>
  ctx.replyWithMarkdown('Press `Next` button or type /next')
)

export const _redeemWizard = new WizardScene(
  'giveWizard',
  _verifyWizard,
  _enterSig,
  _enterMessage,
  _enterAddress,
  (ctx: typeof Context) => {
    ctx.reply('REDEEM WIZARD Done')
    return ctx.scene.leave()
  }
)
