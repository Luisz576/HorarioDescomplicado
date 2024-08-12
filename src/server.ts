import express from 'express'
import cors from 'cors'
import http from 'http'
import globalRoutes from './app/route/global_routes'
import apiRoutes from './app/route/api_routes'
import authApiRoutes from './app/route/auth_api_routes'
import prisma from './app/service/prisma'
import socketio from 'socket.io'
import scheduleOrganizerSocket from './app/socket/schedule_organizer_socket'

const port = 5000

const app = express()
const server = http.createServer(app)
const io = new socketio.Server(server)

app.use(cors())
app.use(express.json())

app.use('/', globalRoutes)
app.use('/api/auth/', authApiRoutes)
app.use('/api/v1/', apiRoutes)

server.listen(port, () => {
  console.log(`Running at port: ${port}`)
})

io.on('connection', (socket) => {
  console.log('New connection: ', socket.id)
  scheduleOrganizerSocket.add(socket)
})

server.on('close', () => {
  prisma.$disconnect()
})
