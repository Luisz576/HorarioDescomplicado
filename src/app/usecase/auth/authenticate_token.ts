import authenticator, { splitMarker } from "../../service/authenticator"
import { Either, left, right } from "../../../core/utils/either"

type AuthenticateTokenResponse = {
    token: string
    callback: (result: Either<any, string | undefined>) => any
}

export default class AuthenticateToken{
  async execute(data: AuthenticateTokenResponse){
    try{
        if(typeof(data.token) != 'string' || data.token == null){
          return data.callback(right(undefined))
        }

        const tokenParts: string[] = data.token.split(splitMarker)

        if(tokenParts.length !== 2){
          return data.callback(right(undefined))
        }

        const [ requester, token ] = tokenParts
        const clientData = authenticator.getClientById(requester)

        if(!clientData){
          return data.callback(right(undefined))
        }

        authenticator.verifyToken(token, (e, decoded) => {
          if(e || !decoded || typeof(decoded) == 'string'){
            return data.callback(right(undefined))
          }
          if(decoded.secret){
            if(decoded.secret == clientData.secret){
              return data.callback(right(clientData.name))
            }
          }
          return data.callback(right(undefined))
        })
    }catch(err){
      return data.callback(left(err))
    }
  }
}
