import IConfigurationRepository from "../../../core/domain/contracts/repository/configuration/iconfiguration_repository";
import IScheduleRepository from "../../../core/domain/contracts/repository/configuration/ischedule_repository";
import IClassroomsRepository from "../../../core/domain/contracts/repository/iclassrooms_repository";
import IProjectRepository from "../../../core/domain/contracts/repository/iproject_repository";
import ISubjectRepository from "../../../core/domain/contracts/repository/isubjects_repository";
import ITeachersRepository from "../../../core/domain/contracts/repository/iteachers_repository";
import IGeneticConfiguration from "../../../core/domain/model/configuration/igenetic_configuration";
import { ScheduleOrganizerProps } from "../../../core/schedule_organizer/schedule_organizer_genetic";
import { Either, left, right } from "../../../core/types/either";
import GetClassrooms from "../project/classrooms/get_classrooms";
import { GetProject } from "../project/get_project";
import IsProjectOwner from "../project/is_project_owner";
import GetSubjects from "../project/subject/get_subjects";
import GetTeachers from "../project/teacher/get_teachers";

interface ScheduleOrganizerRunnerProps{
  props: ScheduleOrganizerProps
  configuration: IGeneticConfiguration
}

export default class GetScheduleOrganizerData{
  constructor(
    private isProjectOwner: IsProjectOwner,
    private getProject: GetProject,
    private getSubjects: GetSubjects,
    private getTeachers: GetTeachers,
    private getClassrooms: GetClassrooms,
  ){}

  async exec(projectId: number, clientId: string): Promise<Either<any, ScheduleOrganizerRunnerProps>>{
    const isOwnerRes = await this.isProjectOwner.exec(projectId, clientId)
    if(isOwnerRes.isRight()){
      if(isOwnerRes.value){
        // get project
        const resProject = await this.getProject.exec(projectId, clientId)
        if(resProject.isRight() && resProject.value != null){
          const project = resProject.value
          const resSubjects = await this.getSubjects.exec(projectId, clientId)
          const resClassrooms = await this.getClassrooms.exec(projectId, clientId)
          const resTeachers = await this.getTeachers.exec(projectId, clientId)
          if(resSubjects.isRight() && resClassrooms.isRight() && resTeachers.isRight()){
            const subjects = resSubjects.value
            const classrooms = resClassrooms.value
            const teachers = resTeachers.value
            // ! TODO
          }
        }
        return left("Error loading data")
      }
      return left("This client isn't the owner of this project")
    }
    return left(isOwnerRes.value)
  }
}
