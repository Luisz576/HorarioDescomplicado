import IGenetic from "../../domain/genetic/igenetic";
import SelectionMethod from "../../domain/genetic/selection_method";
import cloneJson from "../utils/clone_json";
import randomInt from "../utils/random_int";

interface GeneticConfiguration{
  populationSize?: number
  eliteSize?: number
  randomIndividualSize?: number
  mutationRate?: number
  selectionMethod?: SelectionMethod
  maxGenerations?: number
  rankSlice?: number
}

interface GeneticMethods<Phenotype>{
  doesABeatB?: (phenotypeA: Phenotype, phenotypeB: Phenotype) => boolean
  mutatePhenotype: (phenotype: Phenotype) => Phenotype
  crossover: (phenotypeA: Phenotype, phenotypeB: Phenotype) => Phenotype
  fitness: (phenotype: Phenotype) => number
}

export default class Genetic<Phenotype> implements IGenetic<Phenotype>{
  #population: Phenotype[] = []
  #config: Required<GeneticConfiguration> = this.defaultConfig()

  constructor(
    configuration: GeneticConfiguration,
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
  defaultConfig(): Required<GeneticConfiguration>{
    return {
      populationSize: 20,
      eliteSize: 1,
      randomIndividualSize: 0,
      mutationRate: 0.1,
      selectionMethod: 'COMPETITION',
      maxGenerations: 10,
      rankSlice: 1
    }
  }
  updateConfig(configuration: GeneticConfiguration){
    this.#config = this.configWithDefaults(configuration, this.#config)
  }
  configWithDefaults(configuration: Partial<GeneticConfiguration>, defaults: Required<GeneticConfiguration>): Required<GeneticConfiguration>{
    return {
      populationSize: configuration.populationSize ? configuration.populationSize : defaults.populationSize,
      eliteSize: configuration.eliteSize ? configuration.eliteSize : defaults.eliteSize,
      randomIndividualSize: configuration.randomIndividualSize ? configuration.randomIndividualSize : defaults.randomIndividualSize,
      mutationRate: configuration.mutationRate ? configuration.mutationRate : defaults.mutationRate,
      selectionMethod: configuration.selectionMethod ? configuration.selectionMethod : defaults.selectionMethod,
      maxGenerations: configuration.maxGenerations ? configuration.maxGenerations : defaults.maxGenerations,
      rankSlice: configuration.rankSlice ? configuration.rankSlice : defaults.rankSlice
    }
  }
  config(){
    return cloneJson(this.#config)
  }

  // population
  #populate(){
    var size = this.#population.length
    while(this.#population.length < this.#config.populationSize){
      this.#population.push(
        this.#mutatePhenotypeFunction(
          this.#population[randomInt(size)]
        )
      )
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

        nextGeneration.push(phenotype)
        if(this.#doesABeatBFunction(phenotype, competitor)){
            if(Math.random() < this.#config.mutationRate){
                nextGeneration.push(this.#mutatePhenotypeFunction(phenotype))
            } else {
                nextGeneration.push(this.#crossoverFunction(phenotype))
            }
        }else{
            nextGeneration.push(competitor)
        }
    }

    this.#population = nextGeneration
  }

  #rank(){
    this.#population = this.scores(true).map((a) => a.phenotype).slice(0, this.#config.rankSlice)
  }

  #roulette(){

  }

  // utils
  insertRandomly(phenotypes: Phenotype[]){
    if(phenotypes.length > this.#config.populationSize){
      throw new Error('So many phenotypes to insert')
    }
    let alreadyUsed: number[] = []
    for(let i = 0; i < phenotypes.length; i++){
      let targetIndex = randomInt(this.#config.populationSize)
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
  evolve(): IGenetic<Phenotype> {
    let nextGeneration = []
    nextGeneration.push(...this.elite(this.#config.eliteSize))
    nextGeneration.push(...this.randomPhenotypes(this.#config.randomIndividualSize))

    this.#population = nextGeneration

    this.#populate()
    this.#randomizePopulationOrder()

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

    return this
  }
  elite(n_elite?: number | undefined): Phenotype[] {
    if(!n_elite){
      n_elite = 1
    }
    if(n_elite > this.#config.populationSize){
      throw new Error("'n_elite' must be less than 'populationSize'")
    }else if(n_elite < 0){
      throw new Error("'n_elite' must be grater or equal than 0")
    }
    return this.scores(true)
              .map((s) => s.phenotype)
              .slice(0, this.#config.eliteSize)
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
