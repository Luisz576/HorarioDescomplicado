import express from 'express'
import cors from 'cors'
import http from 'http'
import globalRoutes from './app/route/global_routes'
import apiRoutes from './app/route/api_routes'
import authApiRoutes from './app/route/auth_api_routes'
import prisma from './app/service/prisma'
import socketio from 'socket.io'
import scheduleOrganizerSocketFactory from './app/factory/socket/schedule_organizer_socket_factory'

const port = 5000

const app = express()
const server = http.createServer(app)
const io = new socketio.Server(server)

app.use(cors())
app.use(express.json())

app.use('/', globalRoutes)
app.use('/api/auth/', authApiRoutes)
app.use('/api/v1/', apiRoutes)

const scheduleOrganizerSocket = scheduleOrganizerSocketFactory(io)

server.listen(port, () => {
  console.log(`Running at port: ${port}`)
})

server.on('close', () => {
  prisma.$disconnect()
})
