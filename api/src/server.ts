/** @format */

import http from 'http'
import express from 'express'
import { environment } from './config.js'
import { routesInit, middlewareInit } from './middlewares/index.js'
import middlewares from './middlewares/includes.js'
import routes from './routes/index.js'

const PORT = environment.PORT
const router = express()
const gramApi = http.createServer(router)

middlewareInit(middlewares, router)
routesInit(routes, router)

gramApi.listen(PORT, () => {
  console.log(`GRAM API is running: http://localhost:${PORT}`)
})

router.get('*', function (request, response) {
  response.status(404).json('[Error 404: Not Found]')
})
