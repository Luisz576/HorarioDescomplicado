import express from 'express'
import cors from 'cors'
import http from 'http'
import globalRoutes from './app/route/global_routes'
import apiRoutes from './app/route/api_routes'
import publicApiRoutes from './app/route/public_api_routes'

const port = 5000

const app = express()
const server = http.createServer(app)

app.use(cors())
app.use(express.json())

app.use('/', globalRoutes)
app.use('/api/v1/', apiRoutes)
app.use('/api/v1/', publicApiRoutes)

server.listen(port, () => {
    console.log(`Running at port: ${port}`)
})
