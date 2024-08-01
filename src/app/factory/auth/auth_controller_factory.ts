import AuthController from "../../controller/auth_controller";
import AuthenticateToken from "../../usecase/auth/authenticate_token";

export default function authControllerFactory(){
  return new AuthController(
    new AuthenticateToken()
  )
}
