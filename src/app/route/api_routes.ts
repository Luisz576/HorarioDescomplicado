import { Router } from 'express'
import authenticatorMiddlewareFactory from '../factory/middleware/authenticator_middleware_factory'
import ExpressAdapter from '../adapter/express_adapter'
import projectControllerFactory from '../factory/controller/project_controller_factory'

const routes = Router()

const authenticator_middleware = authenticatorMiddlewareFactory()
routes.use((req, res, next) => {
    const adapter = new ExpressAdapter(req, res, next)
    return authenticator_middleware.auth(adapter)
})

const projectController = projectControllerFactory()
routes.post('/project', (req, res, next) => {
  const adapter = new ExpressAdapter(req, res, next)
  return projectController.create(adapter)
})
routes.delete('/project', (req, res, next) => {
  const adapter = new ExpressAdapter(req, res, next)
  return projectController.delete(adapter)
})

export default routes
