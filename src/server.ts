import express from 'express'
import cors from 'cors'
import http from 'http'
import path from 'path'

const __dirname = path.resolve()
const port = 5000

const app = express()
const server = http.createServer(app)

app.use(cors())

app.use('/', express.static(path.join(__dirname, '/src/public')))

// app.use('/api/v1/', routes)

server.listen(port, () => {
    console.log(`Running at port: ${port}`)
})