import authenticator, { splitMarker } from "../../service/authenticator"

export default class GetClientName{
  execute(token: string): string | undefined{
    if(typeof(token) != 'string' || token == null){
      return undefined
    }

    const tokenParts: string[] = token.split(splitMarker)

    if(tokenParts.length !== 2){
      return undefined
    }

    const [ requester, _ ] = tokenParts
    const clientData = authenticator.getClientById(requester)

    if(!clientData){
      return undefined
    }

    return clientData.name
  }
}
