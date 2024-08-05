import SubjectController from "../../controller/subject_controller";
import classroomsRepository from "../../repository/classrooms_repository";
import projectRepository from "../../repository/project_repository";
import subjectRepository from "../../repository/subject_repository";
import GetClientName from "../../usecase/auth/get_client_name";
import CreateAndUpdateClassrooms from "../../usecase/project/classrooms/create_and_update_classrooms";
import DeleteClassesOfClassroomsThatContainsThisSubject from "../../usecase/project/classrooms/delete_classes_of_classrooms_that_contains_this_subject";
import GetClassrooms from "../../usecase/project/classrooms/get_classrooms";
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
      getSubjects,
      new DeleteClassesOfClassroomsThatContainsThisSubject(
        subjectRepository,
        classroomsRepository,
        new CreateAndUpdateClassrooms(
          isProjectOwner,
          classroomsRepository,
          new GetClassrooms(
            isProjectOwner,
            classroomsRepository
          )
        )
      )
    )
  )
}
