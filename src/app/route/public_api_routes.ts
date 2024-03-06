import { Router } from 'express'
import ExpressAdapter from '../adapter/express_adapter'
import authControllerFactory from '../factory/auth/auth_controller_factory'

const routes = Router()

const authController = authControllerFactory()

routes.get('/login', (req, res, next) => {
  const adapter = new ExpressAdapter(req, res, next)
  return authController.login(adapter)
})

export default routes
