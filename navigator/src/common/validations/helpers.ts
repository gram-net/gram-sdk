/** @format */

import validator from 'validator'
import moment from 'moment'

export const validInteger = (value) => validator.isInt(value + '')

export const validFloat = (value) => validator.isFloat(value + '')

export const validEmail = (value) => validator.isEmail(value + '')

export const validDate = (value) => {
  const date = moment(value)
  return date.isValid()
}

export const validMin = (value, min) => {
  const areNumbers = !isNaN(value) && !isNaN(min)
  return areNumbers && +value >= +min
}

export const validMax = (value, max) => {
  const areNumbers = !isNaN(value) && !isNaN(max)
  return areNumbers && +value <= +max
}

export const validRange = (value, min, max) => {
  return validMin(value, min) && validMax(value, max)
}

export const getRanged = (value, min, max) => {
  let ranged = value

  const areNumbers = !isNaN(value) && !isNaN(min) && !isNaN(max)

  if (areNumbers) {
    if (!validMin(value, min)) ranged = parseInt(min)
    if (!validMax(value, max)) ranged = parseInt(max)
  }

  ranged += ''

  return ranged
}
