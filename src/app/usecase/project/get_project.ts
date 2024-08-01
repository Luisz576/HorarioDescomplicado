import IConfigurationRepository from "../../../core/domain/contracts/repository/configuration/iconfiguration_repository"
import IProjectRepository from "../../../core/domain/contracts/repository/iproject_repository"
import { FullIProject } from "../../../core/domain/model/iproject"
import { Either, left, right } from "../../../core/types/either"
import configurationRepository from "../../repository/configuration/configuration_repository"
import projectRepository from "../../repository/project_repository"

class GetProject{
  constructor(
    private projectRepository: IProjectRepository,
    private configurationRepository: IConfigurationRepository
  ){}
  async exec(projectId: number, ownerId: string | undefined): Promise<Either<any, FullIProject | null>>{
    if(projectId > 0 && ownerId){
      const resProject = await this.projectRepository.selectFirst({
        id: projectId
      })
      if(resProject.isRight()){
        if(resProject.value == null){
          return right(null)
        }
        const project = resProject.value
        if(project.ownerId != ownerId){
          return left(401)
        }

        const resProjectConfiguration = await this.configurationRepository.selectProjectConfiguration(project.configurationId)
        if(resProjectConfiguration.isRight()){
          if(resProjectConfiguration.value == null){
            return right(null)
          }
          const projectConfiguration = resProjectConfiguration.value
          const resGeneticConfiguration = await this.configurationRepository.selectGeneticConfiguration(projectConfiguration.geneticConfigurationId)
          if(resGeneticConfiguration.isRight()){
            if(resGeneticConfiguration.value == null){
              return right(null)
            }
            const geneticConfiguration = resGeneticConfiguration.value
            return right({
              id: project.id,
              name: project.name,
              configuration: {
                preferFirstClasses: projectConfiguration.preferFirstClasses,
                id: projectConfiguration.id,
                geneticConfiguration: geneticConfiguration
              }
            })
          }
          return left(resGeneticConfiguration.value)
        }
        return left(resProjectConfiguration.value)
      }
      return left(resProject.value)
    }
    return left(null)
  }
}

const getProject = new GetProject(
  projectRepository,
  configurationRepository
)
export default getProject
