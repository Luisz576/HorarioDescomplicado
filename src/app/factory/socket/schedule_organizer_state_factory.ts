import classroomsRepository from "../../repository/classrooms_repository";
import configurationRepository from "../../repository/configuration/configuration_repository";
import scheduleRepository from "../../repository/configuration/schedule_repository";
import projectRepository from "../../repository/project_repository";
import subjectRepository from "../../repository/subject_repository";
import teachersRepository from "../../repository/teachers_repository";
import ScheduleOrganizerState from "../../socket/schedule_organizer_state";
import IsProjectOwner from "../../usecase/project/is_project_owner";
import GetScheduleOrganizerData from "../../usecase/schedule_organizer/get_schedule_organizer_data";

export default function scheduleOrganizerStateFactory(){
  return new ScheduleOrganizerState(
    new GetScheduleOrganizerData(
      new IsProjectOwner(
        projectRepository
      ),
      projectRepository,
      subjectRepository,
      scheduleRepository,
      teachersRepository,
      classroomsRepository,
      configurationRepository
    )
  )
}
