import authenticator, { splitMarker } from "../../service/authenticator"
import { Either, left, right } from "../../../core/utils/either"

type AuthenticateTokenResponse = {
    token: string
    callback: (result: Either<any, boolean>) => any
}

export default class AuthenticateToken{
    async execute(data: AuthenticateTokenResponse){
        try{
            if(typeof(data.token) != 'string' || data.token == null){
                return data.callback(right(false))
            }

            const tokenParts: string[] = data.token.split(splitMarker)

            if(tokenParts.length !== 2){
              return data.callback(right(false))
            }

            const [ requester, token ] = tokenParts
            const clientData = authenticator.getClientById(requester)

            if(!clientData){
              return data.callback(right(false))
            }

            authenticator.verifyToken(token, (e, decoded) => {
                if(e || !decoded || typeof(decoded) == 'string'){
                    return data.callback(right(false))
                }
                if(decoded.secret){
                    if(decoded.secret == clientData.secret){
                        return data.callback(right(true))
                    }
                }
                return data.callback(right(false))
            })
        }catch(err){
            return data.callback(left(err))
        }
    }
}
