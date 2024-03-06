import AuthenticatorMiddleware from "../../middleware/authenticator_middleware";
import AuthenticateToken from "../../usecase/auth/authenticate_token";


export default function authenticatorMiddlewareFactory(){
  return new AuthenticatorMiddleware(
      new AuthenticateToken()
  )
}
