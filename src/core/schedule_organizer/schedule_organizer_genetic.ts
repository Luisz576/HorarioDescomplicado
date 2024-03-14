import Genetic, { GeneticConfiguration } from "../../lib/genetic/genetic"
import IGeneticConfiguration, { StopMethod } from "../domain/model/configuration/igenetic_configuration"
import ScheduleOrganizerPhenotype from "./phenotype"
import scheduleOrganizerPhenotypeInitializer from "./phenotype_initializer"
import { DayOfWeek } from "../utils/utils"
import ISubjectConfiguration from "../domain/model/configuration/isubject_configuration"
import randomInt from "../utils/random_int"

export interface ScheduleOrganizerProps{
  classrooms: {
    days: {
      dayOfWeek: DayOfWeek
      // schedule: Time[]
    }[],
    acceptedSubjects: number[]
  }[],
  teachers: {
    id: number
    // schedule: Time[]
  }[]
  subjects: {
    id: number
    teacherId: number
    classes: number
    configuration: ISubjectConfiguration
  }[]
}

export function getAcceptableSubject(pProps: ScheduleOrganizerProps, classId: number, canBeEmpty = true): number{
  if(canBeEmpty && Math.random() < 0.05){
    return -1
  }
  let i = 0
  let randSubjectIndex = -1
  let maxIter = pProps.subjects.length * 2
  while(!pProps.classrooms[classId].acceptedSubjects.includes(randSubjectIndex) && i < maxIter){
    randSubjectIndex = randomInt(pProps.subjects.length)
    i++
  }
  if(pProps.classrooms[classId].acceptedSubjects.includes(randSubjectIndex)){
    return randSubjectIndex
  }
  return -1
}

export default class ScheduleOrganizerGenetic{
  #g: Genetic<ScheduleOrganizerPhenotype>
  #phenotypeProps: ScheduleOrganizerProps
  #stopMethod: StopMethod
  constructor(phenotypeProps: ScheduleOrganizerProps, geneticConfiguration: Omit<IGeneticConfiguration, 'id'>){
    this.#phenotypeProps = phenotypeProps
    this.#g = new Genetic<ScheduleOrganizerPhenotype>({
      mutationRate: geneticConfiguration.mutationRate,
      populationSize: geneticConfiguration.populationSize,
      randomIndividualSize: geneticConfiguration.randomIndividualSize,
      rankSlice: geneticConfiguration.rankSlice,
      selectionMethod: geneticConfiguration.selectionMethod
    }, {
      crossover: this.#crossover,
      fitness: this.#fitness,
      mutatePhenotype: this.#mutatePhenotype,
      doesABeatB: this.#doesABeatB,
    }, this.#createInitialPopulation())
    this.#stopMethod = geneticConfiguration.stopMethod
  }

  #crossover(phenotypeA: ScheduleOrganizerPhenotype, phenotypeB: ScheduleOrganizerPhenotype){
    let x, y: ScheduleOrganizerPhenotype
    if(Math.random() < 0.5){
      x = phenotypeA
      y = phenotypeB
    }else{
      x = phenotypeB
      y = phenotypeA
    }
    let randomClass = randomInt(x.classrooms.length)
    let randomDay = randomInt(x.classrooms[randomClass].days.length)
    let randomSubject = randomInt(x.classrooms[randomClass].days[randomDay].subjects.length)
    x.classrooms[randomClass].days[randomDay].subjects[randomSubject] = y.classrooms[randomClass].days[randomDay].subjects[randomSubject]
    return x
  }

  #mutatePhenotype(phenotype: ScheduleOrganizerPhenotype){
    let randomClass = randomInt(phenotype.classrooms.length)
    let randomDay = randomInt(phenotype.classrooms[randomClass].days.length)
    let randomSubject = randomInt(phenotype.classrooms[randomClass].days[randomDay].subjects.length)
    let p = this.#phenotypeProps.subjects[getAcceptableSubject(this.#phenotypeProps, randomClass)]
    phenotype.classrooms[randomClass].days[randomDay].subjects[randomSubject] = p
    return phenotype
  }

  #doesABeatB(phenotypeA: ScheduleOrganizerPhenotype, phenotypeB: ScheduleOrganizerPhenotype){
    let scoreA = this.#fitness(phenotypeA)
    let scoreB = this.#fitness(phenotypeB)
    if(scoreA > scoreB){
      return true
    }
    if(Math.random() < 0.05){
      return true
    }
    return false
  }

  #createInitialPopulation(): ScheduleOrganizerPhenotype[]{
    let initialPopulation: ScheduleOrganizerPhenotype[] = []
    let popSize = this.#g.config().populationSize
    for(let i = 0; i < popSize; i++){
      initialPopulation.push(scheduleOrganizerPhenotypeInitializer(this.#phenotypeProps))
    }
    return initialPopulation
  }

  config(): GeneticConfiguration{
    return this.#g.config()
  }

  phenotypes(): ScheduleOrganizerPhenotype[]{
    return this.#g.population()
  }

  #reachedTheStopMethod(): boolean{
    return false
  }
  async init(){
    while(!this.#reachedTheStopMethod()){
      // TODO:
    }
  }

  /*
  Penalidade:
  - Aula vazia: -A
  - Prof em mais de uma aula na mesma hora: -B
  - Matéria com mais aula seguida que a max: -C
  - Matéria prefere max aula seguida mas não está: -D
  - Matéria sem todas as classes: -E * nAulasFaltantes
  - Matéria com menos aulas do que o min class: -F

  Recompensa:
  - Prof prefere max aula seguida e esta: +G
  - Matérias com numero correto de aulas: +H
  - Dia com horários okays: +I
  - Dia sem aula: +J
  */
  #fitness(phenotype: ScheduleOrganizerPhenotype): number{
    let score = 0

    // for(){
    //   // ver se passou do max de aula daquela aula
    // }

    return score
  }
}
