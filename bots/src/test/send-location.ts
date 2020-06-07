/** @format */

import { Context } from '../telegraf.js'

export function sendLocation(ctx: typeof Context): void {
  let lat = 42.0
  let lon = 42.0
  ctx.replyWithLocation(lat, lon, { live_period: 60 }).then((message: any) => {
    const timer = setInterval(() => {
      lat += Math.random() * 0.001
      lon += Math.random() * 0.001
      ctx.telegram
        .editMessageLiveLocation(lat, lon, message.chat.id, message.message_id)
        .catch(() => clearInterval(timer))
    }, 1000)
  })
}
