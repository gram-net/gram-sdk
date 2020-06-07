/** @format */

export class TestBattery extends Object {}
const style0 = 'color:tomato;font-size:13pt;'
const style1 = 'color:teal;font-size:13pt;'
const style2 = 'color:red;padding:10px;font-size:14pt;'
const style3 =
  'text-transform:uppercase;color:red;font-size:14pt;padding:10px;background:black;'
const style4 = 'font-size:13pt;color:pink;'
export class Test {
  constructor(public imports?: any) {}
  async runTest(tests: string | Array<string>) {
    if (Array.isArray(tests)) {
      for (const t in tests) {
        await this.runTest(tests[t])
      }
      return
    }
    console.log('%c%s', style0, '----------' + tests)
    const arr = tests.split('-')
    const type = arr[0]
    const group = arr[1]
    const battery = arr[2]
    if (!(this as any)[type]) {
      throw new Error('test type ' + type + ' not found')
    }
    const testType = new (this as any)[type](this)
    if (!group || !battery) {
      throw new Error(
        'running multiple tests from a test type is not yet supported. use full name IE: fift-interactive-success'
      )
    }
    if (!testType[group] || typeof testType[group] !== 'object' || group == 'parent') {
      throw new Error('test group ' + group + ' not found')
    }
    if (typeof testType[group] !== 'object' || group == 'parent') {
      throw new Error(
        'test group ' + group + " is not an object or uses reserved word 'parent'"
      )
    }
    const testGroup = testType[group]
    if (!testGroup[battery]) {
      throw new Error('test battery ' + battery + ' not found')
    }
    if (typeof testGroup[battery] !== 'function') {
      throw new Error('test battery ' + battery + ' is not a function')
    }
    try {
      await testGroup[battery]()
      console.log('%c%s', style4, `${type}-${group}-${battery} done...`)
    } catch (e) {
      console.error('UNCAUGHT TEST ERROR', e)
    }
  }
  async runAll() {
    const testList = this.list()
    for (const t in testList) {
      await this.runTest(testList[t])
    }
    //
  }
  list() {
    console.log('--- begin test list ---')
    const testList: Array<string> = []
    for (const i in this) {
      if (typeof this[i] === 'function') {
        // console.log("-", i)
        const testType = new (this as any)[i](this)
        for (const o in testType) {
          if (typeof testType[o] === 'object' && o !== 'parent') {
            // console.log("--", o)
            for (const battery in testType[o]) {
              if (typeof testType[o][battery] === 'function') {
                const testBatteryId = `${i}-${o}-${battery}`
                console.log('%c%s', style1, testBatteryId)
                testList.push(testBatteryId)
              }
            }
          }
        }
      }
    }
    console.log('--- end test list ---')
    return testList
  }
}
