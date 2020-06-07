/** @format */

export const DEBUG = 0
export const DEBUG_FIFT = 1 && DEBUG
export const DEBUG_FIFT_COMMAND = 1 && DEBUG_FIFT
export const DEBUG_FIFT_OUTPUT = 1 && DEBUG_FIFT
import * as fixt from './fixt-files.js'
export const FIXT = fixt

export const log = console.log.bind(console)

export function handleUnhandledRejections(): void {
  process.on('unhandledRejection', (error) => {
    console.error('unhandledRejection')
    console.error(error)
    process.exit()
  })
}
