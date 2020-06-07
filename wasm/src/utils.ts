/** @format */

export function randomStr() {
  return new Date().getTime() + '-' + Math.round(Math.random() * 1e9)
}
export function until(fn: any, delay = 2000, delayTotal = 30, logstr?: string) {
  const fnInfo = fn.toString().replace(/ {2}/g, '').replace(/\n/g, '')

  const pr = new Promise((resolve, reject) => {
    let delayDone = 0
    const logger = () => {
      // console.log('%c%s','background:black;color:gray',`WAIT ${delayDone}/${delayTotal} ${logstr || fnInfo}`);
    }
    let interval: any = null
    const iresolve = (res: any) => {
      clearInterval(interval)
      resolve(res)
    }
    const ireject = (e: any) => {
      clearInterval(interval)
      reject(e)
    }
    function callfn() {
      if (delayTotal > -1) {
        delayDone += delay
        if (delayDone >= delayTotal) {
          clearInterval(interval)
          ireject(new Error('TIMEOUT DURING UNTIL'))
        }
      }
      logger()
      fn(iresolve, ireject)
    }
    logger()
    fn(iresolve, ireject)
    interval = setInterval(callfn, delay)
  })
  return pr
}
export async function sleep(ms = 2500) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}
