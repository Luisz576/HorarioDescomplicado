import socketio from 'socket.io'
import { DefaultEventsMap } from "socket.io/dist/typed-events"
import { Client2ServerEvents, Server2ClientEvents } from '../../core/domain/events/schedule_organizer_events'
import AuthenticateToken from '../usecase/auth/authenticate_token'
import { Either } from '../../core/types/either'
import ScheduleOrganizerState from './schedule_organizer_state'
import scheduleOrganizerStateFactory from '../factory/socket/schedule_organizer_state_factory'
import GetClientName from '../usecase/auth/get_client_name'

type ISocket = socketio.Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>

export default class ScheduleOrganizerSocket{
  #schedules: { [key: string]: ScheduleOrganizerState } = {}

  constructor(
    private io: socketio.Server,
    private getClientName: GetClientName,
    private authenticateToken: AuthenticateToken
  ){
    this.io.on('connection', this.#connSocket.bind(this))
  }

  #connSocket(socket: ISocket) {
    console.log('Connection: ', socket.id)

    this.#schedules[socket.id] = scheduleOrganizerStateFactory()

    // register events
    socket.on(Client2ServerEvents._DISCONNECT, this.#disconnectHandler.bind(this, socket))
    socket.on(Client2ServerEvents.DISCONNECT, this.#gdisconnectHandler.bind(this, socket))
    socket.on(Client2ServerEvents.GENERATE, this.#generateHandler.bind(this, socket))

    // wait to remove if not authenticated
    setTimeout(this.#isAuthenticatedHandler.bind(this, socket), 2000)
  }

  #isAuthenticatedHandler(socket: ISocket){
    if(!(this.#schedules[socket.id] && this.#schedules[socket.id].authenticated)){
      socket.disconnect()
    }
  }

  async #_generateHandler(socket: ISocket, projectId: number, authToken: string, authentication_response: Either<any, string | undefined>){
    if(authentication_response.isRight()){
      const clientName = this.getClientName.execute(authToken)
      if(!clientName){
        return false
      }

      // mark as authenticated
      this.#schedules[socket.id].authenticated = true
      this.#schedules[socket.id].clientId = clientName
      // consumer
      this.#schedules[socket.id].generate(
        (chunk) => {
          console.log("Sending chunk...")
          // emit chunk
          socket.emit(Server2ClientEvents.GENERATING_STATUS, chunk)
        },
        () => {
          // close the connection
          console.log("Generated")
          socket.disconnect()
        },
        (error) => {
          console.error(error)
          socket.disconnect()
        }
      , projectId)
    }
  }
  #generateHandler(socket: ISocket, msg: any){
    if(msg && msg.projectId && msg.authToken){
      // save context
      const callback = this.#_generateHandler.bind(this, socket, msg.projectId, msg.authToken)
      // authenticate
      this.authenticateToken.execute({
        token: msg.authToken,
        callback: callback
      })
    }
  }

  #gdisconnectHandler(socket: ISocket, _: any){
    console.log("Ask to disconnect: ", socket.id)
    socket.disconnect()
  }

  #disconnectHandler(socket: ISocket, _: any){
    console.log('Disconnection: ', socket.id)
    this.#schedules[socket.id].cancel()
    delete this.#schedules[socket.id]
  }
}
