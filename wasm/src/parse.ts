/** @format */

export function saddr(ctx: string): string {
  return getMatch(ctx.match(/=\s(-?[0-9]*:[0-9a-zA-Z\-_]*)/))
}

export function nbaddr(ctx: string) {
  return getMatch(ctx.match(/:\s(0[0-9a-zA-Z\-_]{47})/))
}

export function baddr(ctx: string) {
  return getMatch(ctx.match(/:\s(k[0-9a-zA-Z\-_]{47})/))
}

export function state(ctx: string) {
  return getMatch(ctx.match(/state:\(?account_(active|uninit).*\n/))
}

export function grams(ctx: string) {
  return getMatch(
    ctx.match(/grams:\(nanograms\s*amount:\(var_uint len:[0-9]* value:([0-9]*)/)
  )
}

export function seqno(ctx: string) {
  return getMatch(ctx.match(/x{([0-9A-F]{8})[0-9A-F_]*}\s*last transaction/))
}

export function hash(ctx: string): string {
  return getMatch(ctx.match(/hash = ([0-9A-F]*)/))
}

function getMatch(m: RegExpMatchArray | null): string {
  if (m) {
    return m[1].toString()
  } else {
    return ''
  }
}
