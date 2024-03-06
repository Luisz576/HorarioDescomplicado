import auth_configs from '../config/auth_config.json'
import jwt from 'jsonwebtoken'

interface AllowedClient{
  name: string,
  secret: string,
  id: string
}

const DEFAULT_TOKEN_TIME = 86400
export const splitMarker = '._.'

export default {
  async generateAplicationTokenByClientSecret(client_secret: string, expiresIn?: number): Promise<string | undefined>{
    let client
    for(let i in auth_configs.clients){
        if(auth_configs.clients[i].client_secret == client_secret){
            client = auth_configs.clients[i]
            break
        }
    }
    if(!client){
        return undefined
    }
    const expires: number = expiresIn ? expiresIn : DEFAULT_TOKEN_TIME
    const generated_token = `${client.id}${splitMarker}${this.generateJWTToken({ secret: client.secret }, expires)}`
    return generated_token
  },
  async generateAplicationTokenByUsernameAndPassword(username: string, password: string, expiresIn?: number): Promise<string | undefined>{
    // TODO:
  },
  // default: 1 day
  generateJWTToken(payload: Object, expiresIn?: number): string{
    if(!expiresIn){
        expiresIn = DEFAULT_TOKEN_TIME
    }
    return jwt.sign(payload, auth_configs.auth_secret, { expiresIn })
  },
  verifyToken(token: string, callback?: jwt.VerifyCallback<string | jwt.JwtPayload> | undefined){
    jwt.verify(token, auth_configs.auth_secret, callback)
  },
  getClientById(client_id: string): AllowedClient | undefined{
    for(let i in auth_configs.clients){
        if(auth_configs.clients[i].id == client_id){
            return {
                name: auth_configs.clients[i].name,
                secret: auth_configs.clients[i].secret,
                id: auth_configs.clients[i].id
            }
        }
    }
    return undefined
  }
}
