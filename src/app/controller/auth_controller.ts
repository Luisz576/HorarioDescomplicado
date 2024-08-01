import IHttpContext from "../../core/domain/contracts/http/ihttp_context";
import authenticator from "../service/authenticator";
import AuthenticateToken from "../usecase/auth/authenticate_token";

export default class AuthController{
  constructor(
    private authenticateToken: AuthenticateToken
  ){}
  async login(context: IHttpContext){
    const { username, password } = context.getRequest().body
    if(username && password && typeof(username) == 'string' && typeof(password) == 'string'){
      const token = await authenticator.generateAplicationTokenByUsernameAndPassword(username, password)
      if(token){
          return context.getResponse().json({
              status: 200,
              token
          })
      }else{
        return context.getResponse().sendStatus(401)
      }
    }
    return context.getResponse().sendStatus(400)
  }
  async loginWithToken(context: IHttpContext){
    const { auth_token } = context.getRequest().headers
    if(auth_token && typeof(auth_token) == 'string'){
      const token = await authenticator.generateAplicationTokenByToken(this.authenticateToken, auth_token)
      if(token){
          return context.getResponse().json({
              status: 200,
              token
          })
      }else{
        return context.getResponse().sendStatus(401)
      }
    }
    return context.getResponse().sendStatus(400)
  }
}
