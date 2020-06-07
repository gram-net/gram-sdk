/** @format */

import * as blockies from 'blockies-identicon'
import FastAverageColor from 'fast-average-color'
import * as convert from 'color-convert'

function createColor(buffer: Buffer) {
  const hfloat = buffer[0] / 255
  const sfloat = buffer[buffer.length - 1] / 255
  const lfloat = buffer[Math.round(buffer.length / 2)] / 255

  const h = Math.floor(hfloat * 360)
  const s = sfloat * 60 + 40 + '%'
  const l = (lfloat + lfloat + lfloat + lfloat) * 25 + '%'

  const color = 'hsl(' + h + ',' + s + ',' + l + ')'
  return color
}

/**
 * @returns `HTMLCanvasElement`
 * @return `null` on error
 */
export const identicon = (seed: string, type = 'base64') => {
  if (!seed) return ''

  const buffer = Buffer.from(seed, type as any)

  const fifth = Math.floor(buffer.length / 5)
  const options = {
    color: createColor(buffer.slice(fifth, fifth * 2)),
    bgcolor: createColor(buffer.slice(fifth * 2, fifth * 3)),
    spotcolor: createColor(buffer.slice(fifth * 3, fifth * 4))
  }
  try {
    const icon = blockies.create({
      seed,
      size: 15,
      scale: 10,
      ...options
    }) as HTMLCanvasElement
    return icon
  } catch (e) {
    console.warn(e)
    return null
  }
}

export const getColor = (seed: string) => {
  const icon = identicon(seed)
  if (!icon) return ''
  const fac = new FastAverageColor()
  const color = fac.getColor(icon)
  const [h, s, l]: number[] = convert.rgb.hsl(...color.value)
  // const hsl = `hsl(${h}, ${s}%, ${l > 70 ? 70 : l}%)`;
  const hex = convert.hsl.hex([h, s, l > 70 ? 70 : l < 30 ? 30 : l])
  // console.log(hex);
  return '#' + hex.slice(0, 6)
}
