/** @format */

import Handler from './handler.model.js'

type Route = {
  method: string
  path: string
  handler: Handler | Handler[]
}

export default Route
