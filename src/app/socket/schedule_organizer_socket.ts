import { Socket } from "socket.io"
import { DefaultEventsMap } from "socket.io/dist/typed-events"

type ISocket = Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>

class ScheduleOrganizerSocket{
  #sockets: ISocket[] = []
  add(socket: ISocket) {
    this.#sockets.push(socket)
    // TODO: register listeners
  }
  // TODO: criar conexão websocket, ouvir conexão e desconexão, enviar resposta
}

const scheduleOrganizerSocket = new ScheduleOrganizerSocket()

export default scheduleOrganizerSocket
