import AuthController from "../../controller/auth_controller";

export default function authControllerFactory(){
  return new AuthController()
}
