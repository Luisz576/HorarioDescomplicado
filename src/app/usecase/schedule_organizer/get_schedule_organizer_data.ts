import IConfigurationRepository from "../../../core/domain/contracts/repository/configuration/iconfiguration_repository";
import IScheduleRepository from "../../../core/domain/contracts/repository/configuration/ischedule_repository";
import IClassroomsRepository from "../../../core/domain/contracts/repository/iclassrooms_repository";
import IProjectRepository from "../../../core/domain/contracts/repository/iproject_repository";
import ISubjectRepository from "../../../core/domain/contracts/repository/isubjects_repository";
import ITeachersRepository from "../../../core/domain/contracts/repository/iteachers_repository";
import IGeneticConfiguration from "../../../core/domain/model/configuration/igenetic_configuration";
import { FullIClassroom } from "../../../core/domain/model/iclassroom";
import { FullIProject } from "../../../core/domain/model/iproject";
import { FullISubject } from "../../../core/domain/model/isubject";
import ITeacher from "../../../core/domain/model/iteacher";
import { ScheduleOrganizerProps } from "../../../core/schedule_organizer/schedule_organizer_genetic";
import { Either, left, right } from "../../../core/types/either";
import { DayOfWeek } from "../../../core/utils/utils";
import { subjectToBaseSubject } from "../../mapper/subject_mapper";
import GetClassrooms from "../project/classrooms/get_classrooms";
import { GetProject } from "../project/get_project";
import IsProjectOwner from "../project/is_project_owner";
import GetSubjects from "../project/subject/get_subjects";
import GetTeachers from "../project/teacher/get_teachers";

interface ScheduleOrganizerRunnerProps{
  props: ScheduleOrganizerProps
  configuration: Omit<IGeneticConfiguration, 'id'>
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
            if(subjects.length > 0 && classrooms.length > 0 && teachers.length > 0){
              try{
                return right(this.buildData(project, subjects, classrooms, teachers))
              }catch(e){
                return left(e)
              }
            }
            return left("Not enought data")
          }
        }
        return left("Error loading data")
      }
      return left("This client isn't the owner of this project")
    }
    return left(isOwnerRes.value)
  }

  buildData(project: FullIProject, subjects: FullISubject[], classrooms: FullIClassroom[], teachers: ITeacher[]): ScheduleOrganizerRunnerProps{
    const defaultDays: {
      day: DayOfWeek
      classes: number
    }[] = [
      {
        day: 'MONDAY',
        classes: 4
      },
      {
        day: 'TUESDAY',
        classes: 4
      },
      {
        day: 'WEDNESDAY',
        classes: 4
      },
      {
        day: 'THUSDAY',
        classes: 4
      },
      {
        day: 'FRIDAY',
        classes: 4
      }
    ]

    return {
      props: {
        classrooms: classrooms,
        days: defaultDays,
        subjects: subjects.map(subjectToBaseSubject),
        teachers: teachers
      },
      configuration: {
        populationSize: project.configuration.geneticConfiguration.populationSize,
        maxOrWithoutBetterGenerations: project.configuration.geneticConfiguration.maxOrWithoutBetterGenerations,
        mutationRate: project.configuration.geneticConfiguration.mutationRate,
        randomIndividualSize: project.configuration.geneticConfiguration.randomIndividualSize,
        rankSlice: project.configuration.geneticConfiguration.rankSlice,
        selectionMethod: project.configuration.geneticConfiguration.selectionMethod,
        roundsOfRoulette: project.configuration.geneticConfiguration.roundsOfRoulette,
        stopMethod: project.configuration.geneticConfiguration.stopMethod,
      }
    }
  }
}
