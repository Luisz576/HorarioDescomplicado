import { NextFunction, Request, Response } from 'express'
import IHttpContext from "../../domain/contracts/ihttp_context"
import IRequest from "../../domain/contracts/irequest"
import IResponse from "../../domain/contracts/iresponse"

export default class ExpressAdapter implements IHttpContext {
  private req
  private res
  private nextFunction

  constructor(
    req: Request,
    res: Response,
    nextFunction: NextFunction
  ){
      this.req = req
      this.res = res
      this.nextFunction = nextFunction
  }

  getRequest(): IRequest {
      return this.req
  }

  getResponse(): IResponse {
      return this.res
  }

  next() {
      this.nextFunction()
  }
}
