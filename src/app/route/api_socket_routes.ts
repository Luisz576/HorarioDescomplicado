import { Router } from 'express'
import authenticatorMiddlewareFactory from '../factory/middleware/authenticator_middleware_factory'
import ExpressAdapter from '../adapter/express_adapter'

const routes = Router()

routes.head('/', (req, res, next) => {
  const adapter = new ExpressAdapter(req, res, next)
  return res.status(501)
})

export default routes
