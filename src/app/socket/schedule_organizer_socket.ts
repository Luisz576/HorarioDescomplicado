import socketio from 'socket.io'
import { DefaultEventsMap } from "socket.io/dist/typed-events"
import { Client2ServerEvents, Server2ClientEvents } from '../../core/domain/events/schedule_organizer_events'
import AuthenticateToken from '../usecase/auth/authenticate_token'
import { Either } from '../../core/types/either'
import ScheduleOrganizerState from './schedule_organizer_state'
import scheduleOrganizerStateFactory from '../factory/socket/schedule_organizer_state_factory'

type ISocket = socketio.Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>

export default class ScheduleOrganizerSocket{
  #schedules: { [key: string]: ScheduleOrganizerState } = {}

  constructor(
    private io: socketio.Server,
    private authenticateToken: AuthenticateToken
  ){
    this.io.on('connection', this.#connSocket.bind(this))
  }

  #connSocket(socket: ISocket) {
    console.log('Connection: ', socket.id)

    this.#schedules[socket.id] = scheduleOrganizerStateFactory()

    // register events
    socket.on(Client2ServerEvents.DISCONNECT, this.#disconnectHandler.bind(this, socket))
    socket.on(Client2ServerEvents.GENERATE, this.#generateHandler.bind(this, socket))

    // wait to remove if not authenticated
    setTimeout(this.#isAuthenticatedHandler.bind(this, socket), 2000)
  }

  #isAuthenticatedHandler(socket: ISocket){
    if(!(this.#schedules[socket.id] && this.#schedules[socket.id].authenticated)){
      socket.disconnect()
    }
  }

  #_generateHandler(socket: ISocket, projectId: number, authentication_response: Either<any, string | undefined>){
    if(authentication_response.isRight()){
      // mark as authenticated
      this.#schedules[socket.id].authenticated = true
      // consumer
      this.#schedules[socket.id].generate(
        (chunk) => {
          // emit chunk
          socket.emit(Server2ClientEvents.GENERATING_STATUS, chunk)
        },
        () => {
          // close the connection
          socket.disconnect()
        },
        (error) => {
          console.error(error)
          socket.disconnect()
        }
      , projectId)
    }
  }
  async #generateHandler(socket: ISocket, msg: any){
    if(msg && msg.projectId && msg.authToken){
      // save context
      const callback = this.#_generateHandler.bind(this, socket, msg.projectId)
      // authenticate
      await this.authenticateToken.execute({
        token: msg.authToken,
        callback: callback
      })
    }
  }

  #disconnectHandler(socket: ISocket, _: any){
    console.log('Disconnection: ', socket.id)

    delete this.#schedules[socket.id]
  }
}
