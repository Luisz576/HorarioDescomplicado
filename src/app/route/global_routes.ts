import express from 'express'
import path from 'path'

const ___dirname = path.resolve()

const routes = express.Router()

routes.use('/horariodescomplicado', express.static(path.join(___dirname, '/src/public')))

export default routes
