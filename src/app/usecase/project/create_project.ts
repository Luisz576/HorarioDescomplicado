import IProject from "../../../core/domain/model/iproject"
import IConfigurationRepository from "../../../core/domain/contracts/repository/configuration/iconfiguration_repository"
import IProjectRepository, { CreateProjectProps } from "../../../core/domain/contracts/repository/iproject_repository"
import configurationRepository from "../../repository/configuration/configuration_repository"
import projectRepository from "../../repository/project_repository"
import { Either, left, right } from "../../../core/types/either"
import IScheduleRepository from "../../../core/domain/contracts/repository/configuration/ischedule_repository"
import scheduleRepository from "../../repository/configuration/schedule_repository"

class CreateProject{
  constructor(
    private projectRepository: IProjectRepository,
    private configurationRepository: IConfigurationRepository,
    private scheduleRepository: IScheduleRepository
  ){}
  async exec(props: Partial<Omit<CreateProjectProps, 'configurationId'>>): Promise<Either<any, IProject>>{
    if(props.name && props.name.trim() != "" && props.ownerId && props.ownerId.trim() != ""){
      props.name = props.name.trim()
      props.ownerId = props.ownerId.trim()

      const gcRes = await this.configurationRepository.createGeneticConfiguration()
      if(gcRes.isRight()){
        const pcRes = await this.configurationRepository.createProjectConfiguration({
          geneticConfigurationId: gcRes.value.id
        })
        if(pcRes.isRight()){
          const sRes = await this.scheduleRepository.create()
          if(sRes.isRight()){
            const res = await this.projectRepository.create({
              name: props.name,
              ownerId: props.ownerId,
              configurationId: pcRes.value.id,
              scheduleId: sRes.value.id
            })
            if(res.isRight()){
              return right(res.value)
            }else{
              return res
            }
          }else{
            left(sRes.value)
          }
        }else{
          left(pcRes.value)
        }
      }else{
        return left(gcRes.value)
      }
    }
    return left(null)
  }
}

const createProject = new CreateProject(
  projectRepository,
  configurationRepository,
  scheduleRepository
)
export default createProject
