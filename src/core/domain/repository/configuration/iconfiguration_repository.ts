import { Either } from "../../../utils/either"
import IGeneticConfiguration from "../../model/configuration/igenetic_configuration"
import IProjectConfiguration from "../../model/configuration/iproject_configuration"

export interface CreateProjectConfigurationProps{
  geneticConfigurationId: string
}

export default interface IConfigurationRepository{
  createProjectConfiguration(props: CreateProjectConfigurationProps): Promise<Either<any, IProjectConfiguration>>
  createGeneticConfiguration(): Promise<Either<any, IGeneticConfiguration>>
  createSubjectConfiguration(): Promise<Either<any, string>>
  deleteProjectConfiguration(): Promise<Either<any, Boolean>>
  deleteGeneticConfiguration(): Promise<Either<any, Boolean>>
  deleteSubjectConfiguration(): Promise<Either<any, Boolean>>
  // TODO: edit config
}
