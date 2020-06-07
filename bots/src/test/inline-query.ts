/** @format */

import { Markup } from '../telegraf.js'

export const inlineResult = (ctx: { chosenInlineResult: any }) => {
  console.log('chosen inline result', ctx.chosenInlineResult)
}
export type InlineQuery = { ctx: { chosenInlineResult: any } }
export type InlineQueryCtx = { inlineQuery: any; answerInlineQuery: any }
export const inlineQuery: any = async (ctx: InlineQueryCtx) => {
  const apiUrl = `http://recipepuppy.com/api/?q=${inlineQuery.query}`
  const response = await fetch(apiUrl)
  const { results } = await response.json()
  const recipes = results
    .filter((ctx: { thumbnail: any }) => ctx.thumbnail)
    .map((ctx: { title: any; href: any; thumbnail: any }) => ({
      type: 'article',
      id: ctx.thumbnail,
      title: ctx.title,
      description: ctx.title,
      thumb_url: ctx.thumbnail,
      input_message_content: {
        message_text: ctx.title
      },
      reply_markup: Markup.inlineKeyboard([Markup.urlButton('Go to recipe', ctx.href)])
    }))
  inlineResult(recipes)
}
