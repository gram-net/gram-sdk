/** @format */

import { NextFunction, Response, Request, Router } from 'express'

type Wrapper = (router: Router) => void

export default Wrapper
