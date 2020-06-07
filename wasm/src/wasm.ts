/** @format */

// es-lint-disable
// @ts-ignore
import funcfastcomp from './wasm/funcfastcomp.js'
// @ts-ignore
import fiftfastcomp from './wasm/fiftfastcomp.js'
// @ts-ignore
import fiftfastcompasync from './wasm/fiftfastcompasync.js'
// @ts-ignore
import funcfastcompasync from './wasm/funcfastcompasync.js'
// @ts-ignore
import func from './wasm/func.js'
// @ts-ignore
import fift from './wasm/fift.js'
// es-lint-enable

export { Client } from './client.js'
import * as FIXT from './fixt-files.js'
import { until, sleep, randomStr } from './utils.js'
export type filesExp = Array<{
  encoding?: string
  path?: string
  name: string
  data: ArrayBuffer | string | unknown
}>

export class Wasm {
  scriptName: string | undefined
  files: filesExp
  args: Array<string>
  log: Array<string>
  err: Array<string>
  memInit: ArrayBuffer | undefined
  asmBin: ArrayBuffer | undefined
  wasmSrc: any
  wasmObj: any
  wasmFile: ArrayBuffer | undefined
  onRuntimeInitialized: any
  resolve: any
  reject: any
  currentCmd: { id: string; data: string; log: Array<string>; err: Array<string> }
  cmdResolve: any
  outFiles: Array<string> | undefined
  outFilesBuffers: any
  running: boolean | undefined
  cmdPromise: Promise<unknown> | undefined
  execPromise: any
  crypto?: any
  exited: boolean | undefined
  // promptInitialized: boolean;
  isInteractive: boolean | undefined
  cmdRunning: boolean | undefined
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  constructor(
    wasmSrc: any,
    wasmFile?: ArrayBuffer,
    asmBin?: ArrayBuffer,
    memInit?: ArrayBuffer,
    crypto?: any
  ) {
    this.wasmSrc = wasmSrc
    this.wasmFile = wasmFile
    this.memInit = memInit
    this.asmBin = asmBin
    this.crypto = crypto
    this.currentCmd = { id: '', data: '', log: [], err: [] }
    this.onRuntimeInitialized = () => {}
    this.log = []
    this.err = []
    this.cmdResolve = () => {}
    this.resolve = () => {}
    this.reject = () => {}
    this.args = []
    this.files = []
  }
  async run(input: string) {
    if (!input) {
      return false
    }
    const thisCmd = { id: randomStr(), data: input, log: [], err: [] }
    if (!this.running) {
      throw new Error('CANNOT RUN CMD, PROGRAM IS NOT RUNNING')
    }
    if (this.exited) {
      throw new Error('CANNOT RUN CMD, PROGRAM IS EXITED')
    }

    try {
      if (this.currentCmd.data || this.cmdRunning) {
        throw new Error('A command is already running:' + this.currentCmd.data)
      }

      this.currentCmd = thisCmd
      this.currentCmd.log = []
      this.currentCmd.err = []
      // console.log('%c%s','background-color:orange;padding:10px;color:white',"ISSUE CMD: ")
      // console.log(thisCmd)

      this.cmdPromise = new Promise((resolve, reject) => {
        this.cmdResolve = (result: any) => {
          this.cmdRunning = false
          const returnObj = {
            log: this.currentCmd.log,
            err: this.currentCmd.err
          }
          if (this.currentCmd.err.length < 1) {
            resolve(returnObj)
          } else {
            reject(returnObj)
          }
          delete this.currentCmd
        }
      })
      return this.cmdPromise
    } catch (e) {
      console.log('%c%s %s', 'background-color:red;padding:10px;color:white;', e)
      throw e
    }
  }
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  async exec(
    files: filesExp,
    args: Array<string> = [],
    outFiles: Array<string> = [],
    interactiveCmds?: Array<string>
  ) {
    if (this.running) {
      throw new Error('This WASM program is already running')
    }
    this.destroy()
    this.initializeWasm()
    this.files = files || []
    this.args = args
    this.outFiles = outFiles
    this.execPromise = new Promise((resolve, reject) => {
      this.resolve = resolve
      this.reject = reject
      // DO NOT use await in front of this.wasmSrc
      this.wasmObj = this.wasmSrc({
        emterpreterFile: this.asmBin || undefined,
        wasmBinary: this.wasmFile || undefined,
        memoryInitializer: this.memInit || undefined,
        crypto_module: this.crypto,
        hasCmd: () => {
          this.isInteractive = true
          // console.log('%c%s','background:white;color:black',"C++ Yielded STDIN back to JS Event Loop")

          if (!this.cmdRunning && this.currentCmd) {
            // console.log('%c%s','background:white;color:black',"JS yielded back to C++ STDIN")
            // console.log(this.currentCmd)
            return true
          }
          return false
        },
        waitCmd: async (flags: number) => {
          this.isInteractive = true
          // console.log('%c%s','background:white;color:black',"C++ Yielded STDIN back to JS Event Loop")

          const sleepNumber = 500
          try {
            await until(
              async (resolve: any, reject: any) => {
                if (!this.cmdRunning && this.currentCmd) {
                  // console.log('%c%s','background:white;color:black',"JS yielded back to C++ STDIN")
                  // console.log(this.currentCmd)
                  resolve(true)
                }
              },
              sleepNumber,
              120000,
              'waitCmd'
            )
          } catch (e) {
            this.onExit('THE STDIN SESSION HAS TIMED OUT')
          }
        },
        prompt: () => {
          // console.log('%c%s','color:lightpurple;font-family: serif;',"FIFT-STDIN has pinged prompt()")
          if (this.currentCmd && !this.cmdRunning) {
            this.cmdRunning = true
            // console.log('%c%s','font-size:12pt;font-style:italic;color:green;font-weight:bold;',"NEW PROMPT CMD")
            // console.log(this.currentCmd)
            // this.promptInitialized = false;
            return this.currentCmd.data
          }
          // console.log('PROMPT returning noop')
          return null // NOT undefined
        },
        // ()=>{} wrapper is required onRuntimeInitialized,onAbort,print,printErr
        // onRuntimeInitialized CANNOT be ASYNC!
        onRuntimeInitialized: async (wasmObj: any) => {
          // console.log('runtime initialized, calling this.onRuntimeInitialized')
          try {
            this.onRuntimeInitialized()
            this.writeFiles(wasmObj)
            // console.log('%c calling main', 'color:blue;font-size:16pt;')
            wasmObj.callMain(this.args)

            if (!this.isInteractive) {
              // console.log("NOT INTERACTIVE AND CALLMAIN FINISHED")
              return this.onExit(0)
            }
            // console.log('%c%s', 'background:white;padding:5px;color:blue;font-size:16pt;','INTERACTIVE SESSION STARTED')
            for (const x in interactiveCmds) {
              // console.log('%c%s','font-size:10pt;color:lightyellow;',interactiveCmds[x])

              try {
                const result = await this.run(interactiveCmds[<any>x])
                console.log(
                  '%cCMD RESULT: ' + JSON.stringify(result),
                  'font-size:14pt;color:lightgreen;'
                )
              } catch (result) {
                console.error('COMMAND UNKNOWN ERROR', interactiveCmds[<any>x], result)
                throw result
              }
              await sleep(100) // check for race condition
            }
          } catch (e) {
            console.log('%c%s', 'font-size:20pt;color:red;', 'CAUGHT EXCEPTION')
            console.error(e)
            // throw e
            this.onExit(e)
          }
        },
        locateFile: (file: string) => {
          return './wasm/' + file
        },
        performance: {
          now: function () {
            const res = new Date()
            return res.getTime()
          }
        },
        onAbort: (x: any) => {
          this.onAbort(x)
        },
        onExit: (x: any) => {
          this.onExit(x)
        },
        print: (x: string) => {
          this.print(x)
        },
        printErr: (x: string) => {
          this.printErr(x)
        }
      })
    })
    return this.execPromise
  }
  printErr(str: string) {
    if (str.indexOf('exited (with status: ') > -1) {
      console.log(
        '%cprintERR %s',
        'color:green;font-size:9pt;font-style:italic;',
        'Exit Status Code',
        str
      )
      if (this.isInteractive) {
        this.onExit(69)
      }
    } else {
      // console.log('%c%s','font-size:9pt;font-style:italic;background:black;color:hotpink',str);
      this.err.push(str)
      if (this.currentCmd) {
        // console.log('%c%o','font-size:9pt;font-style:italic;background:black;color:hotpink',this.currentCmd);
        this.currentCmd.err.push(str)
      }
    }
    if (this.currentCmd) {
      this.cmdResolve()
    }
  }
  print(str: string) {
    console.log(
      '%c%s',
      'font-size:9pt;font-style:italic;background:black;color:olive',
      str
    )

    if (str.substr(-3, 3) == ' ok') {
      const style = 'background:black;padding:2px;font-size:9pt;'
      // console.log('%c%s',style+'color:lightyellow;', this.currentCmd.data)
      // console.log('%c%s',style+'color:lightgreen;', str)
      const res = str.substr(0, str.length - 4)
      if (res) {
        this.log.push(res)
        if (this.currentCmd) {
          this.currentCmd.log.push(res)
        }
      }
    } else {
      this.log.push(str)
      if (this.currentCmd) {
        this.currentCmd.log.push(str)
      }
    }
    if (str === ' ok') {
      if (this.currentCmd) {
        this.cmdResolve()
      }
    }
  }
  onAbort(x: any) {
    this.onExit('ABORT:' + x, true)
  }
  destroy() {
    // this.promptInitialized = true;
    delete this.wasmObj // for mobile GC
    this.running = false
    this.cmdRunning = false
  }
  initializeWasm() {
    this.isInteractive = false
    this.outFilesBuffers = {}
    this.exited = false
    this.log = []
    this.err = []
    this.running = true
  }
  onExit(x: any, fromAbort = false) {
    console.info('%cWASM EXIT: %s', 'background-color: #000; color: lightblue', x)
    if (this.exited || x == undefined) return
    this.exited = true
    this.examineResult()
    if (x == 0) this.processOutfiles()
    if (this.currentCmd) {
      this.cmdResolve()
    }
    this.destroy()
    this.resolve()
  }
  examineResult() {
    console.log(
      '%c%s',
      'background-color:green;padding:5px;color:white;font-size:13pt;',
      'EXAMINING RESULT'
    )
    if (this.log.length) {
      console.log(
        '%c%s',
        'font-size:9pt;font-style:italic;background:black;color:olive',
        this.log.join('\n')
      )
    }
    if (!this.log.length || this.err.length) {
      // console.info("%c AN ERROR WAS RETURNED, or there was no output", 'background-color: #000; color: red')
      if (this.err.length) {
        console.log(
          '%c%s',
          'font-size:9pt;font-style:italic;background:black;color:hotpink',
          this.err.join('\n')
        )
      }
    }
  }
  processOutfiles() {
    if (this.outFiles) {
      try {
        for (let i = 0; i < this.outFiles.length; i++) {
          // console.log(i,this.outFiles[i])
          const fileBuffer = this.wasmObj.FS.readFile(this.outFiles[i], {
            encoding: 'binary'
          })
          const filename: string = this.outFiles[i]
          this.outFilesBuffers[filename] = {
            name: filename,
            data: fileBuffer.slice(0) as ArrayBuffer
          }
        }
        if (Object.keys(this.outFilesBuffers).length > 0) {
          console.log('files produced', this.outFilesBuffers)
        }
      } catch (e) {
        // console.error(e)
      }
    }
  }
  writeFiles(wasmObj: any) {
    for (const i in this.files) {
      const thisFile = this.files[<any>i]
      if (this.files[i].encoding === 'binary') {
        wasmObj.FS.writeFile('/' + thisFile.name, new Int8Array(thisFile.data as any), {
          encoding: 'binary'
        })
      } else {
        wasmObj.FS.writeFile('/' + thisFile.name, thisFile.data)
      }
    }
  }
}

export class Fift extends Wasm {
  constructor(
    wasmFile?: ArrayBuffer,
    asmBin?: ArrayBuffer,
    memInit?: ArrayBuffer,
    crypto?: any
  ) {
    super(
      asmBin ? fiftfastcompasync : memInit ? fiftfastcomp : fift,
      wasmFile,
      asmBin,
      memInit,
      crypto
    )
    this.scriptName = 'fift'
    this.onRuntimeInitialized = this.init
  }
  init() {
    this.files.push({
      name: 'Fift.fif',
      data: FIXT.Fiftfif
    })
    this.files.push({
      name: 'TonUtil.fif',
      data: FIXT.TonUtilFif
    })
    this.files.push({
      name: 'Asm.fif',
      data: FIXT.Asmfif
    })
    this.files.push({
      name: 'Lists.fif',
      data: FIXT.ListsFif
    })
  }
}

export class Func extends Wasm {
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  constructor(
    wasmFile?: ArrayBuffer,
    asmBin?: ArrayBuffer,
    memInit?: ArrayBuffer,
    crypto?: any
  ) {
    super(
      asmBin ? funcfastcompasync : memInit ? funcfastcomp : func,
      wasmFile,
      asmBin,
      memInit,
      crypto
    )
    this.scriptName = 'func'
    this.onRuntimeInitialized = this.init
  }
  init() {
    for (const i in this.files) {
      this.args.push('/' + this.files[i].name)
    }
  }
}
