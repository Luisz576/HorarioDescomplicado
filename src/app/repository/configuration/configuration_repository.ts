import IGeneticConfiguration from "../../../domain/model/configuration/igenetic_configuration"
import IProjectConfiguration from "../../../domain/model/configuration/iproject_configuration"
import IConfigurationRepository, { CreateProjectConfigurationProps } from "../../../domain/repository/configuration/iconfiguration_repository"
import prisma from "../../service/prisma"
import { Either, left, right } from "../../utils/either"

class ConfigurationRepository implements IConfigurationRepository{
  async createProjectConfiguration(props: CreateProjectConfigurationProps): Promise<Either<any, IProjectConfiguration>> {
    const res = await prisma.configuration.create({
      data: {
        geneticConfigurationId: props.geneticConfigurationId
      }
    })
    if(res){
      return right(res)
    }
    return left(res)
  }
  async createGeneticConfiguration(): Promise<Either<any, IGeneticConfiguration>> {
    try{
      const res = await prisma.geneticConfiguration.create({})
      return right({
        id: res.id,
        populationSize: res.populationSize,
        eliteSize: res.eliteSize,
        randomIndividualSize: res.randomIndividualSize,
        mutationRate: res.mutationRate.toNumber(),
        trainingMethod: res.trainingMethod,
        stopMethod: res.stopMethod
      })
    }catch(e){
      return left("Couldn't create genetic configuration: " + e)
    }
  }
  createSubjectConfiguration(): Promise<Either<any, string>> {
    throw new Error("Method not implemented.")
  }
  deleteProjectConfiguration(): Promise<Either<any, boolean>> {
    throw new Error("Method not implemented.")
  }
  deleteGeneticConfiguration(): Promise<Either<any, boolean>> {
    throw new Error("Method not implemented.")
  }
  deleteSubjectConfiguration(): Promise<Either<any, boolean>> {
    throw new Error("Method not implemented.")
  }
}

const configurationRepository = new ConfigurationRepository()
export default configurationRepository
