import { Server } from 'socket.io'
import ScheduleOrganizerSocket from '../../socket/schedule_organizer_socket'
import AuthenticateToken from '../../usecase/auth/authenticate_token'
import GetClientName from '../../usecase/auth/get_client_name'

export default function scheduleOrganizerSocketFactory(io: Server){
  return new ScheduleOrganizerSocket(
    io,
    new GetClientName(),
    new AuthenticateToken()
  )
}
