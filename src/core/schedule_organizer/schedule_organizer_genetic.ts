import Genetic, { GeneticConfiguration } from "../../lib/genetic/genetic"
import IGeneticConfiguration, { StopMethod } from "../domain/model/configuration/igenetic_configuration"
import ScheduleOrganizerPhenotype, { freeClassId } from "./phenotype/phenotype"
import scheduleOrganizerPhenotypeInitializer from "./phenotype/phenotype_initializer"
import { DayOfWeek } from "../utils/utils"
import ISubjectConfiguration from "../domain/model/configuration/isubject_configuration"
import randomInt from "../functions/random_int"
import cloneJson from "../functions/clone_json"
import PONTUATION from "./pontuation"
import metaScheduleOrganizerPhenotypeBuilder, { getSubjectById } from "./phenotype/meta_phenotype_builder"
import MetaScheduleOrganizerPhenotype from "./phenotype/meta_phenotype"

export interface BaseSubject{
  id: number
  teacherId: number
  configuration: ISubjectConfiguration
}
export interface ScheduleOrganizerProps{
  classrooms: {
    id: number,
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

    const randomIndividualSize = Math.floor(geneticConfiguration.populationSize * (geneticConfiguration.randomIndividualSize / 100))
    const rankSlice = Math.floor(geneticConfiguration.populationSize * (geneticConfiguration.rankSlice / 100))
    this.#g = new Genetic<ScheduleOrganizerPhenotype>({
      mutationRate: geneticConfiguration.mutationRate,
      populationSize: geneticConfiguration.populationSize,
      randomIndividualSize: randomIndividualSize,
      rankSlice: rankSlice,
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
    if(Math.random() < 0.5){
      let randomClass = randomInt(x.classrooms.length)
      let randomDay1 = randomInt(x.classrooms[randomClass].days.length)
      let randomDay2 = randomInt(x.classrooms[randomClass].days.length)
      let randomSubject1 = randomInt(x.classrooms[randomClass].days[randomDay1].subjects.length)
      let randomSubject2 = randomInt(x.classrooms[randomClass].days[randomDay2].subjects.length)
      x.classrooms[randomClass].days[randomDay1].subjects[randomSubject1] = y.classrooms[randomClass].days[randomDay2].subjects[randomSubject2]
    }else{
      x = this.#changeBlockOfTime(x, y)
    }
    return x
  }

  #changeBlockOfTime(phenotypeA: ScheduleOrganizerPhenotype, phenotypeB: ScheduleOrganizerPhenotype): ScheduleOrganizerPhenotype{
    let X, Y: ScheduleOrganizerPhenotype
    if(Math.random() < 0.5){
      X = phenotypeA
      Y = phenotypeB
    }else{
      X = phenotypeB
      Y = phenotypeA
    }
    let randomClass = randomInt(X.classrooms.length)
    if(Math.random() < 0.5){
      // full day
      let randomDay1 = randomInt(X.classrooms[randomClass].days.length)
      let randomDay2 = randomInt(X.classrooms[randomClass].days.length)
      let aux = X.classrooms[randomClass].days[randomDay1]
      X.classrooms[randomClass].days[randomDay1] = Y.classrooms[randomClass].days[randomDay2]
      Y.classrooms[randomClass].days[randomDay2] = aux
    }else{
      // block in schedule
      let scheduleBlock = []
      let randomBlock = randomInt(X.classrooms[randomClass].days[0].subjects.length)
      for(let daySchedule of Y.classrooms[randomClass].days){
        scheduleBlock.push(daySchedule.subjects[randomBlock])
      }
      for(let d in X.classrooms[randomClass].days){
        X.classrooms[randomClass].days[d].subjects[randomBlock] = scheduleBlock[d]
      }
    }
    return X
  }
  MUTATION_LITTLE_CHANGES = 7
  #mutatePhenotype(phenotype: ScheduleOrganizerPhenotype): ScheduleOrganizerPhenotype{
    if(Math.random() < 0.5){
      return this.#changeBlockOfTime(phenotype, phenotype)
    }else{
      let x = Math.floor(Math.random() * this.MUTATION_LITTLE_CHANGES) + 1
      for(let i = 0; i < x; i++){
        let randomClass = randomInt(phenotype.classrooms.length)
        if(Math.random() < 0.5){
          let randomDay = randomInt(phenotype.classrooms[randomClass].days.length)
          let randomSubject = randomInt(phenotype.classrooms[randomClass].days[randomDay].subjects.length)
          let sId = getAcceptableSubjectId(this.#phenotypeProps, randomClass, true)
          phenotype.classrooms[randomClass].days[randomDay].subjects[randomSubject] = {
            id: sId
          }
        }else{
          let randomDay1 = randomInt(phenotype.classrooms[randomClass].days.length)
          let randomDay2 = randomInt(phenotype.classrooms[randomClass].days.length)
          let randomSubject1 = randomInt(phenotype.classrooms[randomClass].days[randomDay1].subjects.length)
          let randomSubject2 = randomInt(phenotype.classrooms[randomClass].days[randomDay2].subjects.length)
          let aux = phenotype.classrooms[randomClass].days[randomDay1].subjects[randomSubject1]
          phenotype.classrooms[randomClass].days[randomDay1].subjects[randomSubject1] = phenotype.classrooms[randomClass].days[randomDay2].subjects[randomSubject2]
          phenotype.classrooms[randomClass].days[randomDay2].subjects[randomSubject2] = aux
        }
      }
    }
    return phenotype
  }

  #doesABeatB(phenotypeA: ScheduleOrganizerPhenotype, phenotypeB: ScheduleOrganizerPhenotype){
    let scoreA = this.#fitness(phenotypeA)
    let scoreB = this.#fitness(phenotypeB)
    if(scoreA > scoreB){
      return true
    }
    if(Math.abs(scoreB - scoreA) < 30 && Math.random() < 0.5){
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
  metaBestPhenotype(): MetaScheduleOrganizerPhenotype | undefined{
    if(this.#bestPhenotype){
      return metaScheduleOrganizerPhenotypeBuilder(this.#phenotypeProps, this.#bestPhenotype)
    }
    return undefined
  }

  #reachedTheStopMethod(): boolean{
    if(this.#stopMethod == 'MAX_GENERATIONS'){
      return this.#currentGeneration >= this.#maxOrWithoutBetterGenerations
    }else{
      return this.#generationsWithoutBetter >= this.#maxOrWithoutBetterGenerations
    }
  }

  async evolve(callbackEachGenerations?: (generation: number) => boolean){
    let run = true
    while(!this.#reachedTheStopMethod() && run){
      if(callbackEachGenerations){
        run = callbackEachGenerations(this.#currentGeneration)
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
