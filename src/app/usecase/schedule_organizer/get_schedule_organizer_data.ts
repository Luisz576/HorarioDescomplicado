import IConfigurationRepository from "../../../core/domain/contracts/repository/configuration/iconfiguration_repository";
import IScheduleRepository from "../../../core/domain/contracts/repository/configuration/ischedule_repository";
import IClassroomsRepository from "../../../core/domain/contracts/repository/iclassrooms_repository";
import IProjectRepository from "../../../core/domain/contracts/repository/iproject_repository";
import ISubjectRepository from "../../../core/domain/contracts/repository/isubjects_repository";
import ITeachersRepository from "../../../core/domain/contracts/repository/iteachers_repository";
import IGeneticConfiguration from "../../../core/domain/model/configuration/igenetic_configuration";
import { ScheduleOrganizerProps } from "../../../core/schedule_organizer/schedule_organizer_genetic";
import { Either, left, right } from "../../../core/types/either";

interface ScheduleOrganizerRunnerProps{
  props: ScheduleOrganizerProps
  configuration: IGeneticConfiguration
}

export default class GetScheduleOrganizerData{
  constructor(
    private projectRepository: IProjectRepository,
    private subjectRepository: ISubjectRepository,
    private scheduleRepository: IScheduleRepository,
    private teacherRepository: ITeachersRepository,
    private classroomsRepository: IClassroomsRepository,
    private configurationRepository: IConfigurationRepository,
  ){}

  async exec(projectId: number): Promise<Either<any, ScheduleOrganizerRunnerProps>>{
    return left(false)
  }
}
