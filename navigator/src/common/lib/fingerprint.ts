/** @format */

import fp from 'fingerprintjs2'

export const fingerprint = async () => {
  const result = await fp.getPromise()
  const key = result.map((obj) => obj.value).join()
  const fingerprint = fp.x64hash128(key, 31)
  return fingerprint
}
