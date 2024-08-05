import { Router } from 'express'
import authenticatorMiddlewareFactory from '../factory/middleware/authenticator_middleware_factory'
import ExpressAdapter from '../adapter/express_adapter'
import projectControllerFactory from '../factory/controller/project_controller_factory'
import teachersControllerFactory from '../factory/controller/teachers_controller_factory'
import subjectControllerFactory from '../factory/controller/subject_controller_factory'
import classroomsControllerFactory from '../factory/controller/classrooms_controller_factory'

const routes = Router()

const authenticator_middleware = authenticatorMiddlewareFactory()
routes.use((req, res, next) => {
    const adapter = new ExpressAdapter(req, res, next)
    return authenticator_middleware.auth(adapter)
})

const projectController = projectControllerFactory()
routes.get('/projects', (req, res, next) => {
  const adapter = new ExpressAdapter(req, res, next)
  return projectController.show(adapter)
})
routes.get('/project/:pid', (req, res, next) => {
  const adapter = new ExpressAdapter(req, res, next)
  return projectController.get(adapter)
})
routes.post('/project', (req, res, next) => {
  const adapter = new ExpressAdapter(req, res, next)
  return projectController.create(adapter)
})
routes.delete('/project/:pid', (req, res, next) => {
  const adapter = new ExpressAdapter(req, res, next)
  return projectController.delete(adapter)
})
routes.patch('/project/:pid', (req, res, next) => {
  const adapter = new ExpressAdapter(req, res, next)
  return projectController.update(adapter)
})

const teachersController = teachersControllerFactory()
routes.get('/project/:pid/teachers', (req, res, next) => {
  const adapter = new ExpressAdapter(req, res, next)
  return teachersController.show(adapter)
})
routes.patch('/project/:pid/teacher', (req, res, next) => {
  const adapter = new ExpressAdapter(req, res, next)
  return teachersController.storeAndUpdate(adapter)
})

const subjectsController = subjectControllerFactory()
routes.get('/project/:pid/subjects', (req, res, next) => {
  const adapter = new ExpressAdapter(req, res, next)
  return subjectsController.show(adapter)
})
routes.patch('/project/:pid/subjects', (req, res, next) => {
  const adapter = new ExpressAdapter(req, res, next)
  return subjectsController.storeAndUpdate(adapter)
})

const classroomController = classroomsControllerFactory()
routes.get('/project/:pid/classrooms', (req, res, next) => {
  const adapter = new ExpressAdapter(req, res, next)
  return classroomController.show(adapter)
})
routes.patch('/project/:pid/classrooms', (req, res, next) => {
  const adapter = new ExpressAdapter(req, res, next)
  return classroomController.storeAndUpdate(adapter)
})

export default routes
