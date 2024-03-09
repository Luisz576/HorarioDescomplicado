import ProjectController from "../../controller/project_controller";
import GetClientName from "../../usecase/auth/get_client_name";

export default function projectControllerFactory(){
  return new ProjectController(
    new GetClientName()
  )
}
