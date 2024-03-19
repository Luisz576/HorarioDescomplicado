import Genetic, { GeneticConfiguration } from "../../lib/genetic/genetic"
import IGeneticConfiguration, { StopMethod } from "../domain/model/configuration/igenetic_configuration"
import ScheduleOrganizerPhenotype, { freeClassId } from "./phenotype/phenotype"
import scheduleOrganizerPhenotypeInitializer from "./phenotype/phenotype_initializer"
import { DayOfWeek } from "../utils/utils"
import ISubjectConfiguration from "../domain/model/configuration/isubject_configuration"
import randomInt from "../utils/random_int"
import cloneJson from "../utils/clone_json"
import PONTUATION from "./pontuation"
import metaScheduleOrganizerPhenotypeBuilder, { getSubjectById } from "./phenotype/meta_phenotype_builder"

export interface BaseSubject{
  id: number
  teacherId: number
  configuration: ISubjectConfiguration
}
export interface ScheduleOrganizerProps{
  classrooms: {
    acceptedSubjects: {
      subjectId: number
      classes: number
    }[]
  }[],
  days: {
    day: DayOfWeek
    classes: number
  }[],
  teachers: {
    id: number
    // schedule: Time[]
  }[]
  subjects: BaseSubject[]
}

// TODO: add funcionalidade de ver se tem preferencia por materias que faltam
export function getAcceptableSubjectId(pProps: ScheduleOrganizerProps, classId: number, canBeEmpty = true, maxIter = -1): number{
  if(canBeEmpty && Math.random() < 0.2){
    return freeClassId
  }

  let acceptables = []
  for(let a = 0; a < pProps.classrooms[classId].acceptedSubjects.length; a++){
    acceptables.push(pProps.classrooms[classId].acceptedSubjects[a].subjectId)
  }

  let i = 0
  let randSubjectId = freeClassId
  if(maxIter < 0){
    maxIter = pProps.subjects.length * 2
  }
  while(!acceptables.includes(randSubjectId) && i < maxIter){
    randSubjectId = pProps.subjects[randomInt(pProps.subjects.length)].id
    i++
  }
  if(acceptables.includes(randSubjectId)){
    return randSubjectId
  }
  return freeClassId
}

export default class ScheduleOrganizerGenetic{
  #g: Genetic<ScheduleOrganizerPhenotype>
  #phenotypeProps: ScheduleOrganizerProps

  #stopMethod: StopMethod
  #maxOrWithoutBetterGenerations: number

  #currentGeneration: number = 1
  #generationsWithoutBetter: number = 0
  #bestPhenotypeScore: number = Number.NEGATIVE_INFINITY

  #bestPhenotype: ScheduleOrganizerPhenotype | undefined

  constructor(phenotypeProps: ScheduleOrganizerProps, geneticConfiguration: Omit<IGeneticConfiguration, 'id'>){
    this.#phenotypeProps = phenotypeProps
    this.#stopMethod = geneticConfiguration.stopMethod
    this.#maxOrWithoutBetterGenerations = geneticConfiguration.maxOrWithoutBetterGenerations
    this.#g = new Genetic<ScheduleOrganizerPhenotype>({
      mutationRate: geneticConfiguration.mutationRate,
      populationSize: geneticConfiguration.populationSize,
      randomIndividualSize: geneticConfiguration.randomIndividualSize,
      rankSlice: geneticConfiguration.rankSlice,
      selectionMethod: geneticConfiguration.selectionMethod
    }, {
      crossover: this.#crossover.bind(this),
      fitness: this.#fitness.bind(this),
      mutatePhenotype: this.#mutatePhenotype.bind(this),
      doesABeatB: this.#doesABeatB.bind(this),
    }, this.#createInitialPopulation(geneticConfiguration))
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
    // TODO: criar operador em dois pontos ao invés de 1?
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
    let sId = getAcceptableSubjectId(this.#phenotypeProps, randomClass, true)
    phenotype.classrooms[randomClass].days[randomDay].subjects[randomSubject] = {
      id: sId
    }
    if(Math.random() < 0.5){
      let randomClass = randomInt(phenotype.classrooms.length)
      let randomDay1 = randomInt(phenotype.classrooms[randomClass].days.length)
      let randomSubject1 = randomInt(phenotype.classrooms[randomClass].days[randomDay1].subjects.length)
      let randomDay2= randomInt(phenotype.classrooms[randomClass].days.length)
      let randomSubject2 = randomInt(phenotype.classrooms[randomClass].days[randomDay2].subjects.length)
      let s1 = phenotype.classrooms[randomClass].days[randomDay1].subjects[randomSubject1]
      let s2 = phenotype.classrooms[randomClass].days[randomDay2].subjects[randomSubject2]
      phenotype.classrooms[randomClass].days[randomDay1].subjects[randomSubject1] = s2
      phenotype.classrooms[randomClass].days[randomDay2].subjects[randomSubject2] = s1
    }
    return phenotype
  }

  #doesABeatB(phenotypeA: ScheduleOrganizerPhenotype, phenotypeB: ScheduleOrganizerPhenotype){
    let scoreA = this.#fitness(phenotypeA)
    let scoreB = this.#fitness(phenotypeB)
    if(scoreA > scoreB){
      return true
    }
    if(Math.abs(scoreB - scoreA) < 10){
      return true
    }
    return false
  }

  #createInitialPopulation(config: GeneticConfiguration): ScheduleOrganizerPhenotype[]{
    let initialPopulation: ScheduleOrganizerPhenotype[] = []
    let popSize = config.populationSize
    for(let i = 0; i < popSize; i++){
      initialPopulation.push(scheduleOrganizerPhenotypeInitializer(this.#phenotypeProps))
    }
    return initialPopulation
  }

  config(): GeneticConfiguration{
    return this.#g.config()
  }

  currentGeneration(): number{
    return this.#currentGeneration
  }

  phenotypes(): ScheduleOrganizerPhenotype[]{
    return this.#g.population()
  }

  bestPhenotype(): ScheduleOrganizerPhenotype | undefined{
    return this.#bestPhenotype
  }

  #reachedTheStopMethod(): boolean{
    if(this.#stopMethod == 'MAX_GENERATIONS'){
      return this.#currentGeneration >= this.#maxOrWithoutBetterGenerations
    }else{
      return this.#generationsWithoutBetter >= this.#maxOrWithoutBetterGenerations
    }
  }

  async evolve(callbackEach10Generations?: (generation: number) => void){
    while(!this.#reachedTheStopMethod()){
      if(callbackEach10Generations && this.#currentGeneration % 10 == 0){
        callbackEach10Generations(this.#currentGeneration)
      }
      this.#g.evolve()

      let bestPhenotypeScore = this.#g.bestPhenotypesScores(1)
      if(bestPhenotypeScore[0].score > this.#bestPhenotypeScore){
        this.#bestPhenotypeScore = bestPhenotypeScore[0].score
        this.#bestPhenotype = cloneJson(bestPhenotypeScore[0].phenotype)
        this.#generationsWithoutBetter = 0
      }else{
        this.#generationsWithoutBetter++
      }

      this.#currentGeneration++
    }
  }

  #calculateSubjectClassesPenality(subjectId: number, amount: number): number{
    if(subjectId != freeClassId){
      let targetSubject = getSubjectById(this.#phenotypeProps.subjects, subjectId)!
      if(targetSubject.configuration.minConsecutiveClasses > amount){
        return PONTUATION.minClassesPenality
      }
      if(targetSubject.configuration.maxConsecutiveClasses < amount){
        return PONTUATION.maxClassesPenality
      }
      if(targetSubject.configuration.preferMaxConsecutiveClasses &&
        targetSubject.configuration.maxConsecutiveClasses != amount){
        return PONTUATION.prefferMaxClassesPenality
      }
    }
    return 0
  }
  #fitness(phenotype: ScheduleOrganizerPhenotype): number{
    let score = 0

    let metaPhenotype = metaScheduleOrganizerPhenotypeBuilder(this.#phenotypeProps, phenotype)

    if(metaPhenotype.subjects.has(freeClassId)){
      // RULE: Aula vazia
      score -= metaPhenotype.subjects.get(freeClassId)!.totalAmountOfClasses * PONTUATION.emptyClassPenality
    }

    for(let classrom of metaPhenotype.classrooms.values()){
      // RULE: differentAmountOfClassesPenality
      for(let cSubject of this.#phenotypeProps.classrooms[classrom.id].acceptedSubjects){
        let cSubjectVerified = false
        for(let [subjectId, classes] of classrom.totalAmountOfClassesBySubject){
          if(cSubject.subjectId == subjectId){
            cSubjectVerified = true
            if(classes != cSubject.classes){
              score -= Math.abs(cSubject.classes - classes) * PONTUATION.differentAmountOfClassesPenality
            }
            break
          }
        }
        if(!cSubjectVerified){
          score -= cSubject.classes * PONTUATION.differentAmountOfClassesPenality
        }
      }

      //
      for(let daySchedule of classrom.schedule.values()){
        let freeClassesInDay = 0
        let lastSubject = {
          subjectId: -1,
          amount: 0
        }

        for(let subject of daySchedule){
          if(subject.id == freeClassId){
            freeClassesInDay += 1
          }else{
            // RULE: emptyClassInBegin
            if(freeClassesInDay > 0){
              score -= freeClassesInDay * PONTUATION.emptyClassInBegin
              freeClassesInDay = 0
            }
          }

          if(lastSubject.subjectId != subject.id){
            score -= this.#calculateSubjectClassesPenality(lastSubject.subjectId, lastSubject.amount)
            lastSubject = {
              subjectId: subject.id,
              amount: 0
            }
          }
          lastSubject.amount += 1
        }

        score -= this.#calculateSubjectClassesPenality(lastSubject.subjectId, lastSubject.amount)
      }
    }

    // RULE: classesAtSameTimePenality
    for(let day of metaPhenotype.days.values()){
      for(let schedule of day.schedule.values()){
        let teacherClassesInTimeBlock = new Map<number, number>()
        for(let s of schedule){
          let amount = teacherClassesInTimeBlock.get(s.teacherId) ?? 0
          amount += 1
          teacherClassesInTimeBlock.set(s.teacherId, amount)
          if(amount > 0){
            score -= PONTUATION.classesAtSameTimePenality
          }
        }
      }
    }

    return score
  }
}
