/** @format */

import { nanoFactor, symbol } from './constants'
import * as moment from 'moment'

export const int = (value: string | number) => parseInt(value + '')

export const round = (value: string | number) => Math.round(+value)

export const toFixed = (value: string | number, fixed = 2) => Number(value).toFixed(fixed)

export const prefix = (value: string | number, prefix: string | number) =>
  prefix + '' + (value + '')

export const suffix = (value: string | number, suffix: string | number) =>
  value + '' + (suffix + '')

export const numberFormat = (n: string | number) =>
  new Intl.NumberFormat().format(+(n || 0))

export const time = (time: string | number, format = 'MM/DD/YYYY, h:mm:ss a') =>
  (moment as any)(time).format(format) as string

export const gram = (
  n: string | number,
  fromNano = true,
  sym = symbol,
  precision = 5
) => {
  const parsed = +(n || 0) / (fromNano ? nanoFactor : 1)
  const precise = parsed.toPrecision(precision)
  return `${numberFormat(precise)} ${sym}`
}

export const abbrNumber = (value: string | number) => {
  const val = Number(value)
  let newVal: string | number = val
  if (val >= 1000) {
    const suffixes = ['', 'k', 'm', 'b', 't']
    const suffixNum = Math.floor(('' + val).length / 3)
    let shortValue: any = ''
    for (let precision = 2; precision >= 1; precision--) {
      shortValue = parseFloat(
        (suffixNum != 0 ? val / Math.pow(1000, suffixNum) : val).toPrecision(precision)
      )
      const dotLessShortValue = (shortValue + '').replace(/[^a-zA-Z 0-9]+/g, '')
      if (dotLessShortValue.length <= 2) {
        break
      }
    }
    if (shortValue % 1 != 0) shortValue = shortValue.toFixed(1)
    newVal = shortValue + suffixes[suffixNum]
  }
  return newVal
}
