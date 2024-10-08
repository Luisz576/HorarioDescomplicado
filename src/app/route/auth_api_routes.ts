import { Router } from 'express'
import ExpressAdapter from '../adapter/express_adapter'
import authControllerFactory from '../factory/auth/auth_controller_factory'

const routes = Router()

const authController = authControllerFactory()
routes.post('/login', (req, res, next) => {
  const adapter = new ExpressAdapter(req, res, next)
  return authController.login(adapter)
})
routes.post('/login/token', (req, res, next) => {
  const adapter = new ExpressAdapter(req, res, next)
  return authController.loginWithToken(adapter)
})

export default routes
