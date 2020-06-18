/** @format */

import { WizardScene, Composer, Context, Markup } from '../telegraf.js'
import nacl from 'tweetnacl'
const enterSig = new Composer()
import { getAddress, sendGift, checkBalance } from '../lib/cryptoapi-usdt.js'

async function checkSig(ref: any, ctx: any) {
  return new Promise((resolve: any, reject: any) => {
    ref
      .once('value')
      .then((snap: any) => {
        try {
          const giftRecordId = Object.keys(snap.val())[0]
          const giftRecord = snap.val()[giftRecordId]
          if (giftRecord.dateRedeemed && giftRecord.receiverChatId != ctx.chat.id) {
            throw new Error("Trying to redeem someone else's gift")
          }
          if (giftRecord.datePaid) {
            throw new Error('Already paid')
          }
          const giftRecordSigned = {
            senderChatId: giftRecord.senderChatId,
            dateCreated: giftRecord.dateCreated,
            amount: giftRecord.amount
          }
          const signed = nacl.sign(
            Buffer.from(JSON.stringify(giftRecordSigned)),
            ctx.botObj.key.keypair.secretKey
          )
          const sign64 = Buffer.from(signed).toString('base64')
          if (sign64 != ctx.message.text) {
            throw new Error('Gift was not signed by this bot.')
          }
          ctx.session.giftRecord = giftRecord
          ctx.session.giftRecordId = giftRecordId

          const gift = ctx.db
            .ref('gifts/' + giftRecordId)
            .update({
              dateRedeemed: new Date().getTime(),
              receiverChatId: ctx.chat.id
            })
            .then(function () {
              return resolve(giftRecord)
            })
            .catch(function (e: any) {
              console.error(e)
              throw e
            })
        } catch (e) {
          console.error(e)
          reject()
        }
      })
      .catch((error: any) => {
        console.error(error)
        reject()
      })
  })
}

enterSig.on('text', async (ctx: typeof Context) => {
  if (ctx.message.text == '< Main Menu') {
    return ctx.scene.enter('mainScene')
  }

  const gift = ctx.db
    .ref('gifts')
    .orderByChild('token')
    .equalTo(ctx.message.text)
    .limitToFirst(1)

  try {
    await checkSig(gift, ctx)
  } catch (e) {
    return ctx.reply(
      '⛔ Invalid payment token. Try again.',
      Markup.keyboard(['< Main Menu']).resize().extra()
    )
  }

  try {
    const addressInfo = await checkBalance(<string>process.env.GIFTWALLET)
    if (
      BigInt(addressInfo.results[0]) <
      BigInt(parseInt(ctx.session.giftRecord.amount, 10) * 1000000)
    ) {
      throw new Error('Low balance')
    }
  } catch (e) {
    await ctx.reply(
      '⛔ There is not enough money in the gift wallet. Contact the person who sent you a gift.'
    )
    return ctx.scene.enter('mainScene')
  }

  ctx.session.chatid = ctx.chat.id

  await ctx.reply(
    '👍 Your signature has been accepted.\n\n❤ What is your wish for your friend? Write a note; Example:\n\nDear friend, I wish you peace and riches in this life and in paradise.'
  )

  ctx.wizard.next()
})

const enterMessage = new Composer()

enterMessage.on('text', async (ctx: any) => {
  if (ctx.message.text == '< Main Menu') {
    return ctx.scene.enter('mainScene')
  }
  ctx.session.message = ctx.message.text

  await ctx.reply(
    '📱 Either enter your USDT address from Binance/other exchanges,\n\n or download MetaMask/Exodus Wallet from the iOS/Google app store to create a USDT wallet\n\n Any Ethereum wallet address can be used.\n\nExample: 0x2ed04D2iF1D7Fd9f599C49fDD1bd4a3Ed1F4F6A'
  )

  ctx.wizard.next()
})

const enterAddress = new Composer()

enterAddress.on('text', async (ctx: any) => {
  if (ctx.message.text == '< Main Menu') {
    return ctx.scene.enter('mainScene')
  }
  ctx.session.address = ctx.message.text

  try {
    await getAddress(ctx.session.address)
  } catch (e) {
    await ctx.reply(
      '⛔ The wallet address you entered is invalid.\n\nCheck your wallet address and try to redeem your gift again.'
    )
    return ctx.scene.enter('mainScene')
  }
  let tx
  try {
    tx = await sendGift(ctx.session.address, ctx.session.giftRecord.amount)
  } catch (e) {
    await ctx.reply(
      '⛔ The gift could not be sent due to a wallet error.\n\nCheck your wallet address and try to redeem your gift again,\n\nor contact the person who sent you a gift.'
    )
    return ctx.scene.enter('mainScene')
  }
  const gift = ctx.db
    .ref('gifts/' + ctx.session.giftRecordId)
    .update({
      datePaid: new Date().getTime(),
      message: ctx.session.message,
      receiverAddress: ctx.session.address,
      txid: tx.call_tx_hash
    })
    .then(async function () {
      await ctx.reply(
        '💰💰💰💰DONE! Your gift will arrive soon!\n\nMessage: ' +
          ctx.session.message +
          '\n\nAddress: ' +
          ctx.session.address
      )
      ctx.scene.enter('mainScene')
    })
})

export const _redeemWizard = new WizardScene(
  'redeemWizard',
  async (ctx: any) => {
    await ctx.reply(
      '🔑 Enter your gift code. Example:\n\nWVLAo0CWatj03qQg3spLS7798G2LI70Ak2qT8+MphjMNVpbn2OpXj6M6HEFTfgJPGP+xtudPrP1oy/xBq00ECHsic2VuZGVyQ2hhdElkIjo0ODM3NTk3NTUsImRhdGVDcmVhdGVkIjoxNTkyMjQ5NTAxMDM3LCJhbW91bnQiOiIxMCJ9',
      Markup.keyboard(['< Main Menu']).resize().extra()
    )
    return ctx.wizard.next()
  },
  enterSig,
  enterMessage,
  enterAddress
)
