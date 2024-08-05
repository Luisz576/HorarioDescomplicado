import ClassroomsController from "../../controller/classroom_controller";
import classroomsRepository from "../../repository/classrooms_repository";
import projectRepository from "../../repository/project_repository";
import GetClientName from "../../usecase/auth/get_client_name";
import CreateAndUpdateClassrooms from "../../usecase/project/classrooms/create_and_update_classrooms";
import GetClassrooms from "../../usecase/project/classrooms/get_classrooms";
import IsProjectOwner from "../../usecase/project/is_project_owner";

export default function classroomsControllerFactory(){
  const isProjectOwner = new IsProjectOwner(
    projectRepository
  );
  const getClassrooms = new GetClassrooms(
    isProjectOwner,
    classroomsRepository
  )
  return new ClassroomsController(
    new GetClientName(),
    getClassrooms,
    new CreateAndUpdateClassrooms(
      isProjectOwner,
      classroomsRepository,
      getClassrooms
    )
  )
}
