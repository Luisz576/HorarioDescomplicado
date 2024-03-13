import Genetic from "../../lib/genetic/genetic"
import IGeneticConfiguration from "../domain/model/configuration/igenetic_configuration";
import ScheduleOrganizerPhenotype from "./phenotype";

export default class ScheduleOrganizerGenetic{
  #g
  constructor(configuration: IGeneticConfiguration){
    this.#g = new Genetic<ScheduleOrganizerPhenotype>({
      mutationRate: configuration.mutationRate,
      populationSize: configuration.populationSize,
      randomIndividualSize: configuration.randomIndividualSize,
      rankSlice: configuration.rankSlice,
      selectionMethod: configuration.selectionMethod
    }, {
      crossover: this.crossover,
      fitness: this.fitness,
      mutatePhenotype: this.mutatePhenotype,
      doesABeatB: this.doesABeatB,
    }, this.createInitialPopulation())
  }

  crossover(phenotype: ScheduleOrganizerPhenotype){
    return phenotype
  }

  fitness(phenotype: ScheduleOrganizerPhenotype){
    return 0
  }

  mutatePhenotype(phenotype: ScheduleOrganizerPhenotype){
    return phenotype
  }

  doesABeatB(phenotypeA: ScheduleOrganizerPhenotype, phenotypeB: ScheduleOrganizerPhenotype){
    return true
  }

  createInitialPopulation(){
    return []
  }
}
