/** @format */

import { NextFunction, Response, Request } from 'express'

type Handler = (req: Request, res: Response, next: NextFunction) => Promise<void> | void

export default Handler
