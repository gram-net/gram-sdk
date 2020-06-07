/** @format */

import { WizardScene, Composer, Context, Scene } from '../telegraf.js'

import { _enterAmount } from './enter-amount.js'
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

export const _giveWizard = new WizardScene(
  'giveWizard',
  _verifyWizard,
  _enterAmount,
  stepHandler,
  (ctx: typeof Context) => {
    ctx.reply('GIVE WIZARD Done')
    return ctx.scene.leave()
  }
)
