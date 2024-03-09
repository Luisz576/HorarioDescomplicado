import IHttpContext from "../../core/domain/http/ihttp_context"
import AuthenticateToken from "../usecase/auth/authenticate_token"
import logError from "../../core/utils/log_error"

export default class AuthenticatorMiddleware{
    constructor(
        private authenticateToken: AuthenticateToken
    ){}
    async auth(httpContext: IHttpContext){
        const { auth_token } = httpContext.getRequest().headers
        if(auth_token){
          return this.authenticateToken.execute({
              token: auth_token,
              callback: (authentication_response) => {
                  if(authentication_response.isRight()){
                      if(authentication_response.value){
                        return httpContext.next()
                      }
                      return httpContext.getResponse().sendStatus(401)
                  }
                  logError(authentication_response.value, 'AuthenticationMiddleware.auth', 'AuthenticateToken')
                  return httpContext.getResponse().sendStatus(500)
              }
          })
        }
        return httpContext.getResponse().sendStatus(401)
    }
}
