import IProjectRepository from "../../../core/domain/repository/iproject_repository"
import projectRepository from "../../repository/project_repository"
import { Either, left, right } from "../../../core/types/either"
import IConfigurationRepository from "../../../core/domain/repository/configuration/iconfiguration_repository"
import configurationRepository from "../../repository/configuration/configuration_repository"

class DeleteProject{
  constructor(
    private projectRepository: IProjectRepository,
    private configurationRepository: IConfigurationRepository
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
              await this.projectRepository.delete(targetId)
              await this.configurationRepository.deleteProjectConfiguration(resProject.value.configurationId)
              await this.configurationRepository.deleteGeneticConfiguration(resProjectConfiguration.value.geneticConfigurationId)
              return right(true)
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
  configurationRepository
)
export default deleteProject
