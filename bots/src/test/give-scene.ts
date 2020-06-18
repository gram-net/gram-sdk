/** @format */

import { Markup, Scene, BaseScene, Context } from '../telegraf.js'
import nacl from 'tweetnacl'
import { getAddress, checkBalance } from '../lib/cryptoapi-usdt.js'
import moment from 'moment'

export const giveScene: typeof Scene = new BaseScene('giveScene')
giveScene.enter(async (ctx: typeof Context) => {
  if (ctx.chat.id !== 483759755 && ctx.chat.id !== 483759755) {
    await ctx.reply('⛔ Access denied')
    return ctx.scene.enter('mainScene')
  }
  const addressLink = 'https://etherscan.io/address/' + process.env.GIFTWALLET
  await ctx.reply(
    'Bot Admin',
    Markup.inlineKeyboard([
      Markup.urlButton('Click to view gift wallet address', addressLink)
    ]).extra()
  )

  ctx.reply(
    '💲 To give a gift, enter the amount in USD. Example: $10',
    Markup.keyboard(['< Main Menu', 'Gift History']).resize().extra()
  )
})

async function giftHistory(ctx: typeof Context) {
  const gifts = ctx.db.ref('/gifts').orderByChild('datePaid')
  return new Promise((resolve: any, reject: any) => {
    const paid: Array<any> = []
    const pending: Array<any> = []
    const stuck: Array<any> = []
    gifts
      .once('value')
      .then(async (snap: any) => {
        const records = snap.val()
        for (const record in records) {
          const rec = records[record]
          if (rec.datePaid) {
            paid.push(rec)
          } else if (rec.dateRedeemed) {
            stuck.push(rec)
          } else {
            pending.push(rec)
          }
          // console.warn(record, records[record])
        }
        await ctx.reply('______\n\n_____ STUCK _____\n\n______')
        for (const i in stuck) {
          await ctx.reply(
            '----BEGIN STUCK RECORD----\n\n' +
              moment(pending[i].dateRedeemed).format('MM/DD/YYYY h:mm a') +
              '\n\n$ ' +
              stuck[i].amount +
              '\n\n----TOKEN:----'
          )
          await ctx.reply(stuck[i].token)
        }
        await ctx.reply('______\n\n_____ PAID _____\n\n______')
        for (const i in paid) {
          await ctx.reply(
            moment(pending[i].datePaid).format('MM/DD/YYYY h:mm a') +
              '\n\n$ ' +
              paid[i].amount +
              '\n\n' +
              paid[i].message
          )
        }
        await ctx.reply('______\n\n_____ PENDING _____\n\n______')
        for (const i in pending) {
          await ctx.reply(
            '----BEGIN PENDING RECORD----\n\n' +
              'Created: ' +
              moment(pending[i].dateCreated).format('MM/DD/YYYY h:mm a') +
              '\n\n$ ' +
              pending[i].amount +
              '\n\n----TOKEN:----'
          )
          await ctx.reply(pending[i].token)
        }
        resolve()
      })
      .catch((error: any) => {
        console.error(error)
        reject()
      })
  })
}

giveScene.on('text', async (ctx: typeof Context) => {
  if (ctx.message.text == '< Main Menu') {
    return ctx.scene.enter('mainScene')
  }
  if (ctx.message.text == 'Gift History') {
    return await giftHistory(ctx)
  }

  try {
    console.warn('checking GAS balance')
    const addressInfo = await getAddress(<string>process.env.GIFTWALLET)
    if (BigInt(addressInfo.balance) < 51617790000000000n) {
      throw new Error('Low balance')
    }
  } catch (e) {
    await ctx.reply(
      '⛔ There is not enough ETH/GAS in the gift wallet (< 0.05).\n\nCheck the admin section to fund the wallet.'
    )
    return ctx.scene.enter('mainScene')
  }
  try {
    console.warn('checking Tether balance')
    const addressInfo = await checkBalance(<string>process.env.GIFTWALLET)
    if (BigInt(addressInfo.results[0]) < 50000000n) {
      throw new Error('Low balance')
    }
  } catch (e) {
    await ctx.reply(
      '⛔ There is not enough USDT in the gift wallet (< $50).\n\nCheck the admin section to fund the wallet.'
    )
    return ctx.scene.enter('mainScene')
  }
  const message = ctx.message.text.replace('$', '')

  if (parseInt(message, 10).toFixed(0) !== message) {
    return ctx.reply('Invalid amount. Try again. Example: $10')
  }
  // TODO: generate share-able token link
  // TODO: Save record in DB
  const newObj: any = {
    senderChatId: ctx.chat.id,
    dateCreated: new Date().getTime(),
    amount: message
  }
  const signed = nacl.sign(
    Buffer.from(JSON.stringify(newObj)),
    ctx.botObj.key.keypair.secretKey
  )
  newObj.token = Buffer.from(signed).toString('base64')

  await ctx.db.ref('gifts').push(newObj)

  await ctx.reply(
    '✅ Done! Your gift is ready to send.\n\n🔑 Share the following gift code and the telegram bot link to the receiver:'
  )
  await ctx.reply(newObj.token)
  await ctx.reply(
    'I have sent you a gift! Open the gift bot at this link and use the gift code I send you: http://t.me/' +
      process.env.BOTID_TEST
  )

  ctx.scene.enter('mainScene')
})
