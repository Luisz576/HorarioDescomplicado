import { Either } from "../../../../types/either"
import IGeneticConfiguration from "../../../model/configuration/igenetic_configuration"
import IProjectConfiguration from "../../../model/configuration/iproject_configuration"

export interface CreateProjectConfigurationProps{
  geneticConfigurationId: number
}

export default interface IConfigurationRepository{
  createProjectConfiguration(props: CreateProjectConfigurationProps): Promise<Either<any, IProjectConfiguration>>
  createGeneticConfiguration(): Promise<Either<any, IGeneticConfiguration>>
  createSubjectConfiguration(): Promise<Either<any, any>>
  deleteProjectConfiguration(targetId: number): Promise<Either<any, Boolean>>
  deleteGeneticConfiguration(targetId: number): Promise<Either<any, Boolean>>
  deleteSubjectConfiguration(targetId: number): Promise<Either<any, Boolean>>
  selectProjectConfiguration(targetId: number): Promise<Either<any, IProjectConfiguration | null>>
  selectGeneticConfiguration(targetId: number): Promise<Either<any, IGeneticConfiguration | null>>
  selectSubjectConfiguration(targetId: number): Promise<Either<any, any | null>>
  // TODO: edit config
}
