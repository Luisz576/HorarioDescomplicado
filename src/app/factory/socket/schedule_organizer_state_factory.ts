import classroomsRepository from "../../repository/classrooms_repository";
import configurationRepository from "../../repository/configuration/configuration_repository";
import scheduleRepository from "../../repository/configuration/schedule_repository";
import projectRepository from "../../repository/project_repository";
import subjectRepository from "../../repository/subject_repository";
import teachersRepository from "../../repository/teachers_repository";
import ScheduleOrganizerState from "../../socket/schedule_organizer_state";
import GetClassrooms from "../../usecase/project/classrooms/get_classrooms";
import getProject from "../../usecase/project/get_project";
import IsProjectOwner from "../../usecase/project/is_project_owner";
import GetSubjects from "../../usecase/project/subject/get_subjects";
import GetTeachers from "../../usecase/project/teacher/get_teachers";
import GetScheduleOrganizerData from "../../usecase/schedule_organizer/get_schedule_organizer_data";

export default function scheduleOrganizerStateFactory(){
  const isProjectOwner = new IsProjectOwner(
    projectRepository
  )
  return new ScheduleOrganizerState(
    new GetScheduleOrganizerData(
      isProjectOwner,
      getProject,
      new GetSubjects(
        isProjectOwner,
        subjectRepository
      ),
      new GetTeachers(
        isProjectOwner,
        teachersRepository
      ),
      new GetClassrooms(
        isProjectOwner,
        classroomsRepository
      ),
    )
  )
}
