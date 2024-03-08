import IHttpContext from "../../domain/http/ihttp_context";
import authenticator from "../service/authenticator";

export default class AuthController{
  async login(context: IHttpContext){
    const { username, password } = context.getRequest().body
    if(username && password && typeof(username) == 'string' && typeof(password) == 'string'){
      const token = await authenticator.generateAplicationTokenByUsernameAndPassword(username, password)
      if(token){
          return context.getResponse().json({
              status: 200,
              token
          })
      }
    }
    return context.getResponse().sendStatus(400)
  }
}
