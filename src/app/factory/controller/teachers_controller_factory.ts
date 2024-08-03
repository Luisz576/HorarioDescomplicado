import TeacherController from "../../controller/teacher_controller";
import projectRepository from "../../repository/project_repository";
import teachersRepository from "../../repository/teachers_repository";
import GetClientName from "../../usecase/auth/get_client_name";
import IsProjectOwner from "../../usecase/project/is_project_owner";
import CreateAndUpdateTeachers from "../../usecase/project/teacher/create_and_update_teachers";
import GetTeachers from "../../usecase/project/teacher/get_teachers";

export default function teachersControllerFactory(){
  const isProjectOwner = new IsProjectOwner(
    projectRepository
  )
  const getTeachers = new GetTeachers(
    isProjectOwner,
    teachersRepository
  )
  return new TeacherController(
    new GetClientName(),
    getTeachers,
    new CreateAndUpdateTeachers(
      isProjectOwner,
      teachersRepository,
      getTeachers
    )
  )
}
