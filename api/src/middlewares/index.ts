/** @format */

import { Router } from 'express'
import Route from '../models/route.model.js'
import Wrapper from '../models/wrapper.model.js'
import parser from 'body-parser'
import cors from 'cors'

export function routesInit(routes: Route[], router: Router) {
  for (const route of routes) {
    const { method, path, handler } = route
    ;(router as any)[method](path, handler)
  }
}

export function middlewareInit(middleware: Wrapper[], router: Router) {
  for (const m of middleware) {
    m(router)
  }
}

export function corsHandler(router: Router) {
  router.use(cors({ credentials: true, origin: true }))
}

export function parseHandler(router: any) {
  router.set('json spaces', 2)
  router.use(parser.urlencoded({ extended: true }))
  router.use(parser.json())
}
