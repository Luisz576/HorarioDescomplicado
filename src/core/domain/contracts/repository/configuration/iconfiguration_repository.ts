import { Either } from "../../../../types/either"
import IGeneticConfiguration from "../../../model/configuration/igenetic_configuration"
import IProjectConfiguration from "../../../model/configuration/iproject_configuration"
import { PartialFullIProject } from "../../../model/iproject"

export interface CreateProjectConfigurationProps{
  geneticConfigurationId: number
}

export default interface IConfigurationRepository{
  createProjectConfiguration(props: CreateProjectConfigurationProps): Promise<Either<any, IProjectConfiguration>>
  deleteProjectConfiguration(targetId: number): Promise<Either<any, Boolean>>
  selectProjectConfiguration(targetId: number): Promise<Either<any, IProjectConfiguration | null>>
  updateProjectConfiguration(configurationId: number | undefined, geneticConfigurationId: number | undefined, toUpdate: PartialFullIProject): Promise<Either<any, boolean>>

  createGeneticConfiguration(): Promise<Either<any, IGeneticConfiguration>>
  deleteGeneticConfiguration(targetId: number): Promise<Either<any, Boolean>>
  selectGeneticConfiguration(targetId: number): Promise<Either<any, IGeneticConfiguration | null>>

  createSubjectConfiguration(): Promise<Either<any, any>>
  deleteSubjectConfiguration(targetId: number): Promise<Either<any, Boolean>>
  selectSubjectConfiguration(targetId: number): Promise<Either<any, any | null>>

  // TODO: edit config
}
