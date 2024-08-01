import { FullIProject } from "../../../core/domain/model/iproject"
import IConfigurationRepository from "../../../core/domain/contracts/repository/configuration/iconfiguration_repository"
import IProjectRepository from "../../../core/domain/contracts/repository/iproject_repository"
import configurationRepository from "../../repository/configuration/configuration_repository"
import projectRepository from "../../repository/project_repository"
import { Either, left, right } from "../../../core/types/either"

class UpdateProject{
  constructor(
    private projectRepository: IProjectRepository,
    private configurationRepository: IConfigurationRepository
  ){}
  async exec(targetId: number, client: string, update: Partial<FullIProject>): Promise<Either<any, boolean>>{
    if(targetId > 0){
      if(update.name){
        const resProject = await projectRepository.update(targetId, {
          name: update.name
        })
        if(!(resProject.isRight() && resProject.value)){
          return right(false)
        }
      }
      if(update.configuration){
        const rProject = await projectRepository.selectFirst({
          id: targetId
        })
        if(!(rProject.isRight() && rProject.value != null)){
          return right(false)
        }
        const configurationId = rProject.value.configurationId
        const resProjectConfiguration = await this.configurationRepository.selectProjectConfiguration(rProject.value.configurationId)
        if(!(resProjectConfiguration.isRight() && resProjectConfiguration.value != null)){
          return right(false)
        }
        const geneticConfigurationId = resProjectConfiguration.value.geneticConfigurationId
        const resConfig = await this.configurationRepository.updateProjectConfiguration(configurationId, geneticConfigurationId, update)
        if(!(resConfig.isRight() && resConfig.value)){
          return right(false)
        }
      }
      return right(true)
    }
    return left(null)
  }
}

const updateProject = new UpdateProject(
  projectRepository,
  configurationRepository
)
export default updateProject
