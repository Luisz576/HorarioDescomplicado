import IProjectRepository from "../../../core/domain/contracts/repository/iproject_repository"
import projectRepository from "../../repository/project_repository"
import { Either, left, right } from "../../../core/types/either"
import IConfigurationRepository from "../../../core/domain/contracts/repository/configuration/iconfiguration_repository"
import configurationRepository from "../../repository/configuration/configuration_repository"
import ITeachersRepository from "../../../core/domain/contracts/repository/iteachers_repository"
import teachersRepository from "../../repository/teachers_repository"
import ISubjectRepository from "../../../core/domain/contracts/repository/isubjects_repository"
import subjectRepository from "../../repository/subject_repository"
import IClassroomsRepository from "../../../core/domain/contracts/repository/iclassrooms_repository"
import classroomsRepository from "../../repository/classrooms_repository"
import IScheduleRepository from "../../../core/domain/contracts/repository/configuration/ischedule_repository"
import scheduleRepository from "../../repository/configuration/schedule_repository"

class DeleteProject{
  constructor(
    private projectRepository: IProjectRepository,
    private configurationRepository: IConfigurationRepository,
    private teachersRepository: ITeachersRepository,
    private subjectRepository: ISubjectRepository,
    private classroomsRepository: IClassroomsRepository,
    private scheduleRepository: IScheduleRepository
  ){}
  async exec(targetId: number, owner: string | undefined): Promise<Either<any, boolean>>{
    if(targetId && targetId > 0 && owner && owner.trim() != ""){
      owner = owner.trim()

      const resProject = await this.projectRepository.selectFirst({
        id: targetId
      })
      if(resProject.isRight()){
        if(resProject.value == null){
          return left("Project Not founded!")
        }
        if(resProject.value.ownerId == owner){
          const resProjectConfiguration = await this.configurationRepository.selectProjectConfiguration(resProject.value.configurationId)

          if(resProjectConfiguration.isRight()){
            if(resProjectConfiguration.value != null){
              const resA = await this.projectRepository.delete(targetId)
              const resB = await this.configurationRepository.deleteProjectConfiguration(resProject.value.configurationId)
              const resC = await this.scheduleRepository.delete(resProject.value.scheduleId)
              const resD = await this.configurationRepository.deleteGeneticConfiguration(resProjectConfiguration.value.geneticConfigurationId)
              const resE = await this.teachersRepository.deleteAllFromProject(targetId)
              const resF = await this.subjectRepository.deleteAllFromProject(targetId)
              const resG = await this.classroomsRepository.deleteAllFromProject(targetId)
              return right(
                resA.isRight()
                && resB.isRight()
                && resC.isRight()
                && resD.isRight()
                && resE.isRight()
                && resF.isRight()
                && resG.isRight()
              )
            }
          }else{
            return left(resProjectConfiguration.value)
          }
        }
        return right(false)
      }
      return left(resProject.value)
    }
    return left(null)
  }
}

const deleteProject = new DeleteProject(
  projectRepository,
  configurationRepository,
  teachersRepository,
  subjectRepository,
  classroomsRepository,
  scheduleRepository
)
export default deleteProject
