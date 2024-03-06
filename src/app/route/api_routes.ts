import { Router } from 'express'
import authenticatorMiddlewareFactory from '../factory/middleware/authenticator_middleware_factory'
import ExpressAdapter from '../adapter/express_adapter'

const routes = Router()

const authenticator_middleware = authenticatorMiddlewareFactory()
routes.use((req, res, next) => {
    const adapter = new ExpressAdapter(req, res, next)
    return authenticator_middleware.auth(adapter)
})

// routes.get('/<algo>', (req, res, next) => {
//   const adapter = new ExpressAdapter(req, res, next)
//   return AlgoController.show(adapter)
// })

export default routes
