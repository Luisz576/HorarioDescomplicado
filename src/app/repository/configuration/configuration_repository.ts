import IGeneticConfiguration from "../../../core/domain/model/configuration/igenetic_configuration"
import IProjectConfiguration from "../../../core/domain/model/configuration/iproject_configuration"
import IConfigurationRepository, { CreateProjectConfigurationProps } from "../../../core/domain/repository/configuration/iconfiguration_repository"
import prisma from "../../service/prisma"
import { Either, left, right } from "../../../core/types/either"

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
        rankSlice: res.rankSlice,
        randomIndividualSize: res.randomIndividualSize,
        mutationRate: res.mutationRate.toNumber(),
        selectionMethod: res.selectionMethod,
        stopMethod: res.stopMethod,
        maxOrWithoutBetterGenerations: res.maxOrWithoutBetterGenerations,
        roundsOfRoulette: res.roundsOfRoulette
      })
    }catch(e){
      return left("Couldn't create genetic configuration: " + e)
    }
  }
  async createSubjectConfiguration(): Promise<Either<any, string>> {
    throw new Error("Method not implemented.")
  }
  async deleteProjectConfiguration(targetId: number): Promise<Either<any, boolean>> {
    try{
      await prisma.configuration.delete({
        where: {
          id: targetId
        }
      })
      return right(true)
    }catch(e){
      return left("couldn't delete project configuration: " + e)
    }
  }
  async deleteGeneticConfiguration(targetId: number): Promise<Either<any, boolean>> {
    try{
      await prisma.geneticConfiguration.delete({
        where: {
          id: targetId
        }
      })
      return right(true)
    }catch(e){
      return left("couldn't delete genetic configuration: " + e)
    }
  }
  async deleteSubjectConfiguration(targetId: number): Promise<Either<any, boolean>> {
    throw new Error("Method not implemented.")
  }
  async selectProjectConfiguration(targetId: number): Promise<Either<any, IProjectConfiguration | null>>{
    try{
      return right(
        await prisma.configuration.findFirst({
          where: {
            id: targetId
          }
        })
      )
    }catch(e){
      return left(e)
    }
  }
  async selectGeneticConfiguration(targetId: number): Promise<Either<any, IGeneticConfiguration | null>>{
    try{
      const gc = await prisma.geneticConfiguration.findFirst({
        where: {
          id: targetId
        }
      })
      if(gc == null){
        return right(null)
      }
      return right({
        id: gc.id,
        mutationRate: gc.mutationRate.toNumber(),
        populationSize: gc.populationSize,
        randomIndividualSize: gc.randomIndividualSize,
        rankSlice: gc.rankSlice,
        roundsOfRoulette: gc.roundsOfRoulette,
        selectionMethod: gc.selectionMethod,
        stopMethod: gc.stopMethod,
        maxOrWithoutBetterGenerations: gc.maxOrWithoutBetterGenerations
      })
    }catch(e){
      return left(e)
    }
  }
  async selectSubjectConfiguration(targetId: number): Promise<Either<any, any | null>>{
    throw new Error("Method not implemented.")
  }
}

const configurationRepository = new ConfigurationRepository()
export default configurationRepository
