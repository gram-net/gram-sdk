/** @format */

import * as zxcvbn from 'zxcvbn'

export default function (value: string, key: string | null = null) {
  const strength = zxcvbn(value || '')
  const val = key === null ? strength : strength[key]
  return val
}
