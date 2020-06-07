/** @format */

export type LogType = 'log' | 'warn' | 'info' | 'error' | 'dir' | 'debug'

export class LogEntry {
  count: number

  constructor(public args: any[], public type: LogType = 'log') {
    this.count = 1
  }

  incrementCounter() {
    ++this.count
  }
}
