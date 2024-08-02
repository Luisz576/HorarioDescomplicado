import TeachersController from "../../controller/teachers_controller";
import projectRepository from "../../repository/project_repository";
import teachersRepository from "../../repository/teachers_repository";
import GetClientName from "../../usecase/auth/get_client_name";
import IsProjectOwner from "../../usecase/project/is_project_owner";
import GetTeachers from "../../usecase/project/teacher/get_teachers";

export default function teachersControllerFactory(){
  return new TeachersController(
    new GetClientName(),
    new GetTeachers(
      new IsProjectOwner(
        projectRepository
      ),
      teachersRepository
    )
  )
}
