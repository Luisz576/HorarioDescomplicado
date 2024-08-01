import IProject from "../../../core/domain/model/iproject"
import IConfigurationRepository from "../../../core/domain/contracts/repository/configuration/iconfiguration_repository"
import IProjectRepository, { CreateProjectProps } from "../../../core/domain/contracts/repository/iproject_repository"
import configurationRepository from "../../repository/configuration/configuration_repository"
import projectRepository from "../../repository/project_repository"
import { Either, left, right } from "../../../core/types/either"

class CreateProject{
  constructor(
    private projectRepository: IProjectRepository,
    private configurationRepository: IConfigurationRepository
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
          const res = await this.projectRepository.create({
            name: props.name,
            ownerId: props.ownerId,
            configurationId: pcRes.value.id,
          })
          if(res.isRight()){
            return right(res.value)
          }else{
            return res
          }
        }else{
          left(pcRes)
        }
      }else{
        return left(gcRes)
      }
    }
    return left(null)
  }
}

const createProject = new CreateProject(
  projectRepository,
  configurationRepository
)
export default createProject
