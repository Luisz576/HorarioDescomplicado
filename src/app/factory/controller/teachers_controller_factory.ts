import TeacherController from "../../controller/teacher_controller";
import classroomsRepository from "../../repository/classrooms_repository";
import projectRepository from "../../repository/project_repository";
import subjectsRepository from "../../repository/subject_repository";
import teachersRepository from "../../repository/teachers_repository";
import GetClientName from "../../usecase/auth/get_client_name";
import CreateAndUpdateClassrooms from "../../usecase/project/classrooms/create_and_update_classrooms";
import DeleteClassesOfClassroomsThatContainsThisSubject from "../../usecase/project/classrooms/delete_classes_of_classrooms_that_contains_this_subject";
import GetClassrooms from "../../usecase/project/classrooms/get_classrooms";
import IsProjectOwner from "../../usecase/project/is_project_owner";
import { DeleteTeacherSubjects } from "../../usecase/project/subject/delete_teacher_subjects";
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
      getTeachers,
      new DeleteTeacherSubjects(
        subjectsRepository,
        new DeleteClassesOfClassroomsThatContainsThisSubject(
          subjectsRepository,
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
  )
}
