import auth_configs from '../config/auth_config.json'
import jwt from 'jsonwebtoken'
import sha256 from 'crypto-js/sha256'
import AuthenticateToken from '../usecase/auth/authenticate_token'

interface AllowedClient{
  name: string,
  secret: string,
  id: string
}

const DEFAULT_TOKEN_TIME = 86400
export const splitMarker = '._.'

export default {
  async generateAplicationTokenByToken(auth_token: AuthenticateToken,token: string, expiresIn?: number): Promise<string | undefined>{
    let client_id
    await auth_token.auth_id({
      token: token,
      callback(result) {
        if(result.isRight()){
          client_id = result.value
          return
        }
        client_id = null
      },
    })
    if(client_id && client_id != null){
      const client = this.getClientById(client_id)
      if(client){
        const expires: number = expiresIn ? expiresIn : DEFAULT_TOKEN_TIME
        const generated_token = `${client.id}${splitMarker}${this.generateJWTToken({ secret: client.secret }, expires)}`
        return generated_token
      }
    }
    return undefined
  },
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
    const passwordSha256 = sha256(password).toString()
    let user
    for(let i in auth_configs.users){
      if(auth_configs.users[i].username.toLowerCase() == username.toLowerCase()
        && auth_configs.users[i].password == passwordSha256){
        user = auth_configs.users[i]
        break
      }
    }
    if(!user){
      return undefined
    }
    let client
    for(let i in auth_configs.clients){
      if(auth_configs.clients[i].id == user.client_id){
        client = auth_configs.clients[i]
      }
    }
    if(!client){
      return undefined
    }
    const expires: number = expiresIn ? expiresIn : DEFAULT_TOKEN_TIME
    const generated_token = `${client.id}${splitMarker}${this.generateJWTToken({ secret: client.secret }, expires)}`
    return generated_token
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
