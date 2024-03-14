import IGenetic from "./igenetic";
import SelectionMethod from "./selection_method";
import { cloneJson, randomInt } from './utils'

export interface GeneticConfiguration{
  populationSize: number
  randomIndividualSize: number
  mutationRate: number
  selectionMethod: SelectionMethod
  rankSlice: number
  roundsOfRoulette: number
}

export interface GeneticMethods<Phenotype>{
  doesABeatB?: (phenotypeA: Phenotype, phenotypeB: Phenotype) => boolean
  mutatePhenotype: (phenotype: Phenotype) => Phenotype
  crossover: (phenotypeA: Phenotype, phenotypeB: Phenotype) => Phenotype
  fitness: (phenotype: Phenotype) => number
}

export default class Genetic<Phenotype> implements IGenetic<Phenotype>{
  #population: Phenotype[] = []
  #config: GeneticConfiguration = this.defaultConfig()

  constructor(
    configuration: Partial<GeneticConfiguration>,
    private methods: GeneticMethods<Phenotype>,
    initialPopulation: Phenotype[]
  ){
    if(initialPopulation.length < 0){
      throw new Error("'InitialPopulation' need be greater than 0")
    }
    this.#population = cloneJson(initialPopulation)
    this.#config = this.configWithDefaults(configuration, this.#config)
  }

  // config
  defaultConfig(): GeneticConfiguration{
    return {
      populationSize: 20,
      randomIndividualSize: 0,
      mutationRate: 0.1,
      selectionMethod: 'COMPETITION',
      rankSlice: 1,
      roundsOfRoulette: 1
    }
  }
  updateConfig(configuration: Partial<GeneticConfiguration>){
    this.#config = this.configWithDefaults(configuration, this.#config)
  }
  configWithDefaults(configuration: Partial<GeneticConfiguration>, defaults: GeneticConfiguration): GeneticConfiguration{
    return {
      populationSize: configuration.populationSize ? configuration.populationSize : defaults.populationSize,
      randomIndividualSize: configuration.randomIndividualSize ? configuration.randomIndividualSize : defaults.randomIndividualSize,
      mutationRate: configuration.mutationRate ? configuration.mutationRate : defaults.mutationRate,
      selectionMethod: configuration.selectionMethod ? configuration.selectionMethod : defaults.selectionMethod,
      rankSlice: configuration.rankSlice ? configuration.rankSlice : defaults.rankSlice,
      roundsOfRoulette: configuration.roundsOfRoulette ? configuration.roundsOfRoulette : defaults.roundsOfRoulette
    }
  }
  config(){
    return cloneJson(this.#config)
  }

  // population
  #populate(){
    if(this.#population.length == 1 && this.#config.populationSize > 1){
      this.#population.push(this.#mutatePhenotypeFunction(this.#population[0]))
    }
    var size = this.#population.length
    while(this.#population.length < this.#config.populationSize){
      if(Math.random() < this.#config.mutationRate){
        this.#population.push(this.#mutatePhenotypeFunction(this.#population[randomInt(size)]))
      } else {
        this.#population.push(this.#crossoverFunction(this.#population[randomInt(size)]))
      }
    }
  }

  #randomizePopulationOrder(){
    for(let i = 0; i < this.#population.length; i++) {
      let toChangeIndex = randomInt(this.#population.length)
      let aux = this.#population[toChangeIndex]
      this.#population[toChangeIndex] = this.#population[i]
      this.#population[i] = aux
    }
  }

  // functions
  #doesABeatBFunction(phenotypeA: Phenotype, phenotypeB: Phenotype): boolean{
    if(this.methods.doesABeatB){
      return this.methods.doesABeatB(cloneJson(phenotypeA), cloneJson(phenotypeB))
    }
    return this.#fitnessFunction(phenotypeA) >= this.#fitnessFunction(phenotypeB)
  }

  #mutatePhenotypeFunction(phenotype: Phenotype): Phenotype{
    return this.methods.mutatePhenotype(cloneJson(phenotype))
  }

  #crossoverFunction(phenotype: Phenotype): Phenotype{
    return this.methods.crossover(cloneJson(phenotype), this.randomPhenotype())
  }

  #fitnessFunction(phenotype: Phenotype): number{
    return this.methods.fitness(cloneJson(phenotype))
  }

  // methods
  #competition(){
    var nextGeneration = []

    for(let i = 0; i < this.#population.length - 1; i += 2){
        let phenotype = this.#population[i]
        let competitor = this.#population[i+1]

        if(this.#doesABeatBFunction(phenotype, competitor)){
          nextGeneration.push(phenotype)
        }else{
          nextGeneration.push(competitor)
        }
    }

    this.#population = nextGeneration
  }

  #rank(){
    this.#population = this.bestPhenotypes(this.#config.rankSlice)
  }

  #roulette(){
    let nextGeneration: Phenotype[] = []
    let sortedPopulation = this.scores(true)

    for(let i = 0; i < this.#config.roundsOfRoulette; i++){
      let index = this.#roulettePhenotype(sortedPopulation)
      nextGeneration.push(sortedPopulation.slice(index, 1)[0].phenotype)
    }

    this.#population = nextGeneration
  }
  #roulettePhenotype(sortedPopulation: { score: number; phenotype: Phenotype; }[]): number{
    let min = Number.POSITIVE_INFINITY
    for(let p in sortedPopulation){
      if(sortedPopulation[p].score < min){
        min = sortedPopulation[p].score
      }
    }

    let fixMin = 0
    if(min < 0){
      fixMin = min * -1
    }
    let total = 0.0
    for(let p in sortedPopulation){
      sortedPopulation[p].score = sortedPopulation[p].score + fixMin
      total += sortedPopulation[p].score
    }

    let r = Math.random()
    for(let i = 0; i < sortedPopulation.length; i++){
      if(r < (sortedPopulation[i].score*1.0 / total)){
        return i
      }
    }

    return 0
  }

  // utils
  insertRandomly(phenotypes: Phenotype[]){
    if(phenotypes.length > this.#config.populationSize){
      throw new Error('So many phenotypes to insert')
    }

    let alreadyUsed: number[] = []
    for(let i = 0; i < phenotypes.length; i++){
      let targetIndex = this.#population.length

      if(this.#population.length >= this.#config.populationSize){
        targetIndex = randomInt(this.#config.populationSize)
      }

      if(alreadyUsed.includes(targetIndex)){
        i--
        continue
      }

      if(this.#population.length <= targetIndex){
        targetIndex = this.#population.length
        this.#population.push(cloneJson(phenotypes[i]))
      }else{
        this.#population[targetIndex] = phenotypes[i]
      }

      alreadyUsed.push(targetIndex)
    }
  }

  // implementation
  isPopulationComplete(): boolean{
    return this.#population.length >= this.#config.populationSize
  }
  evolve(): IGenetic<Phenotype> {
    if(!this.isPopulationComplete()){
      this.#populate()
      this.#randomizePopulationOrder()
    }

    let nextGeneration = this.randomPhenotypes(this.#config.randomIndividualSize)

    switch(this.#config.selectionMethod){
      case 'COMPETITION':
        this.#competition()
        break
      case 'RANK':
        this.#rank()
        break
      case "ROULETTE":
        this.#roulette()
        break
    }

    if(nextGeneration.length > 0){
      this.insertRandomly(nextGeneration)
    }

    this.#populate()
    this.#randomizePopulationOrder()

    return this
  }
  bestPhenotypes(n?: number | undefined): Phenotype[] {
    return this.bestPhenotypesScores(n)
              .map((s) => s.phenotype)
  }
  bestPhenotypesScores(n?: number | undefined): {score: number, phenotype: Phenotype}[] {
    if(!n){
      n = 1
    }
    if(n > this.#config.populationSize){
      throw new Error("'n' must be less than 'populationSize'")
    }else if(n < 0){
      throw new Error("'n' must be grater or equal than 0")
    }
    return this.scores(true)
              .slice(0, n)
  }
  scores(ranked?: boolean): {score: number, phenotype: Phenotype}[] {
    let scoredPopulation = this.population().map((phenotype) => {
      return {
          phenotype: cloneJson(phenotype),
          score: this.#fitnessFunction(phenotype)
      }
    })
    if(ranked){
      scoredPopulation = scoredPopulation.sort((a, b) => b.score - a.score)
    }
    return scoredPopulation
  }
  randomPhenotype(): Phenotype {
    let p = this.population()
    return p[randomInt(p.length)]
  }
  randomPhenotypes(n_phenotypes?: number | undefined): Phenotype[] {
    if(!n_phenotypes){
      n_phenotypes = 1
    }
    if(n_phenotypes > this.#config.populationSize){
      throw new Error("'n_phenotypes' must be less than 'populationSize'")
    }else if(n_phenotypes < 0){
      throw new Error("'n_phenotypes' must be grater or equal than 0")
    }
    let p = this.population()
    let phenotypes: Phenotype[] = []
    for(let i = 0; i < n_phenotypes; i++){
      phenotypes.push(p.splice(randomInt(p.length), 1)[0])
    }
    return phenotypes
  }
  population(): Phenotype[] {
    return cloneJson(this.#population)
  }
  clone(): IGenetic<Phenotype> {
    return new Genetic(cloneJson(this.#config), cloneJson(this.methods), this.population())
  }
}
