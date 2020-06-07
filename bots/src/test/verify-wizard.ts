/** @format */

import { WizardScene, Composer, Context, Scene } from '../telegraf.js'

const stepHandler = new Composer()
stepHandler.action('next', (ctx: typeof Context) => {
  ctx.reply('Step 1. Via inline button')
  return ctx.wizard.next()
})
stepHandler.command('next', (ctx: typeof Context) => {
  ctx.reply('Step 1. Via command')
  return ctx.wizard.next()
})
stepHandler.use((ctx: typeof Context) =>
  ctx.replyWithMarkdown('Press `Next` button or type /next')
)

export const _verifyWizard = new WizardScene(
  'verifyWizard',
  stepHandler,
  (ctx: typeof Context) => {
    ctx.reply('VERIFY WIZARD Done')
    return ctx.scene.leave()
  }
)
