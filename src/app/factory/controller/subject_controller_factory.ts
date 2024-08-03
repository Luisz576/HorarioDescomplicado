import SubjectController from "../../controller/subject_controller";
import projectRepository from "../../repository/project_repository";
import subjectRepository from "../../repository/subject_repository";
import GetClientName from "../../usecase/auth/get_client_name";
import IsProjectOwner from "../../usecase/project/is_project_owner";
import CreateAndUpdateSubjects from "../../usecase/project/subject/create_and_update_subjects";
import GetSubjects from "../../usecase/project/subject/get_subjects";

export default function subjectControllerFactory(){
  const isProjectOwner = new IsProjectOwner(
    projectRepository
  )
  const getSubjects = new GetSubjects(
    isProjectOwner,
    subjectRepository
  )
  return new SubjectController(
    new GetClientName(),
    getSubjects,
    new CreateAndUpdateSubjects(
      isProjectOwner,
      subjectRepository,
      getSubjects
    )
  )
}
