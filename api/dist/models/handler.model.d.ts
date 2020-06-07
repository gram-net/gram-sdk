/** @format */
import { NextFunction, Response, Request } from 'express';
declare type Handler = (req: Request, res: Response, next: NextFunction) => Promise<void> | void;
export default Handler;
//# sourceMappingURL=handler.model.d.ts.map