import IProject from "../../../domain/model/iproject"
import IConfigurationRepository from "../../../domain/repository/configuration/iconfiguration_repository"
import IProjectRepository, { CreateProjectProps } from "../../../domain/repository/iproject_repository"
import configurationRepository from "../../repository/configuration/configuration_repository"
import projectRepository from "../../repository/project_repository"
import { Either, left, right } from "../../../core/utils/either"

class CreateProject{
  constructor(
    private projectRepository: IProjectRepository,
    private configurationRepository: IConfigurationRepository
  ){}
  async exec(props: Omit<CreateProjectProps, 'configurationId'>): Promise<Either<any, IProject>>{
    if(props.name && props.name.trim() != ""){
      const gcRes = await this.configurationRepository.createGeneticConfiguration()
      if(gcRes.isRight()){
        const pcRes = await this.configurationRepository.createProjectConfiguration({
          geneticConfigurationId: gcRes.value.id
        })
        if(pcRes.isRight()){
          const res = await this.projectRepository.create({
            name: props.name,
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
