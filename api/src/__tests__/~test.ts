/** @format */

import { Server } from 'http'
import { createReadStream } from 'fs'
import FormData from 'form-data'
import express from 'express'
import axios from 'axios'

const PORT = 8084
const ENDPOINT = `http://localhost:${PORT}/`
let server: Server
const TMPDIR = '/tmp/gram/wasm'

process.on('unhandledRejection', (error) => {
  console.warn('unhandledRejection:')
  console.warn(error)
  process.exit(2)
})

async function start() {
  const app = express()

  app.use((req, res, next) => {
    // console.warn({req, res, next})
    next()
  })

  server = app.listen(PORT, async () => {
    console.log('listening @', server.address())
    // setTimeout(test, 1000)
    await testPing()
    await testTonkit()
  })
  server.on('error', (error) => console.warn({ error }))
}

async function testPing() {
  const result = await axios(`${ENDPOINT}ping`)
  console.warn('ping: from api:', result.data)
}

async function testTonkit() {
  const form = new FormData()
  const testgiverAddr = 'kf9mZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZnw8'

  console.warn('healthcheck, last: ')
  const result = await axios(`${ENDPOINT}last`)
  // console.warn(result)

  console.warn('gifter account obj from client: ')
  const result2 = await axios(`${ENDPOINT}getaccount?address=${testgiverAddr}`)
  console.warn('getaccount: from api', result2.data)
  const result3 = await axios(`${ENDPOINT}getaccount?address=${testgiverAddr}1`)
  console.warn('getaccount: bad address', result3.data)

  const result4 = await axios(
    `${ENDPOINT}runmethod?method=seqno&address=${testgiverAddr}`
  )
  console.warn('seqno: from api', result4.data)
  const result5 = await axios(
    `${ENDPOINT}runmethod?method=seqno&address=${testgiverAddr}1`
  )
  console.warn('seqno: bad address', result5.data)
  const result6 = await axios(
    `${ENDPOINT}runmethod?method=badmethod&address=${testgiverAddr}`
  )
  console.warn('seqno: bad method', result6.data)

  form.append('file', createReadStream('new-testgiver-query.boc'))
  try {
    const headers = form.getHeaders()
    const result7 = await axios.post(`${ENDPOINT}sendfile`, form, { headers })
    console.warn('testAccount', result7)
  } catch (error) {
    console.error(error)
    console.warn({ error: 'could not call sendfile' })
  }
  server.close()
  console.warn('done')
  process.exit()
}

start()
