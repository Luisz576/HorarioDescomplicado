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
    let randomClass = randomInt(x.classrooms.length)
    let randomDay = randomInt(x.classrooms[randomClass].days.length)
    let randomSubject = randomInt(x.classrooms[randomClass].days[randomDay].subjects.length)
    x.classrooms[randomClass].days[randomDay].subjects[randomSubject] = y.classrooms[randomClass].days[randomDay].subjects[randomSubject]
    if(Math.random() < this.#g.config().mutationRate){
      x = this.#mutatePhenotype(x)
    }
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
  async evolve(){
    while(!this.#reachedTheStopMethod()){
      console.warn('generation:',this.#currentGeneration)
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

  /*
  Penalidade:
  - Aula vazia: -1
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

    let metaPhenotype = metaScheduleOrganizerPhenotypeBuilder(this.#phenotypeProps, phenotype)

    if(metaPhenotype.subjects.has(freeClassId)){
      // RULE: Aula vazia
      score -= metaPhenotype.subjects.get(freeClassId)!.totalAmountOfClasses * PONTUATION.emptyClassPenality
    }

    for(let [d, day] of metaPhenotype.days){
      for(let [sc, schedule] of day.schedule){
        let classesAtSameTime = new Map<number, number>()
        for(let dayTime in schedule){
          let teacherClassesAtSameTime = classesAtSameTime.get(schedule[dayTime].teacherId) ?? -1
          classesAtSameTime.set(schedule[dayTime].teacherId, teacherClassesAtSameTime + 1)
        }
        for(let [tcast, teacherClassesAtSameTime] of classesAtSameTime){
          // RULE: Prof em mais de uma aula na mesma hora
          score -= teacherClassesAtSameTime * PONTUATION.classesAtSameTimePenality
        }
      }
    }

    for(let [c, classroom] of metaPhenotype.classrooms){
      for(let [subjectId, totalAmountOfClassesOfSubjectOfClassroom] of classroom.totalAmountOfClassesBySubject){
        if(subjectId == freeClassId){
          continue
        }
        for(let subject of this.#phenotypeProps.classrooms[classroom.id].acceptedSubjects){
          if(subject.subjectId == subjectId){
            if(subject.classes == totalAmountOfClassesOfSubjectOfClassroom){
              // RULE: Matéria com as aulas certinho
              score += PONTUATION.correctAmountOfClassesReward
            }else{
              // RULE: Matéria sem as aulas certinho
              score -= Math.abs(subject.classes - totalAmountOfClassesOfSubjectOfClassroom) * PONTUATION.differentAmountOfClassesPenality
            }
          }
        }
      }

      function calculatePenalityScoreOfMinMaxConsecutiveClasses(pProps: ScheduleOrganizerProps, subjectId: number, amount: number): number{
        if(subjectId != freeClassId){
          let subject = getSubjectById(pProps.subjects, subjectId)
          if(subject){
            if(subject.configuration.minConsecutiveClasses > amount){
              // RULE: menos de minClasses
              return (subject.configuration.minConsecutiveClasses - amount) * PONTUATION.minClassesPenality
            }
            if(subject.configuration.maxConsecutiveClasses < amount){
              // RULE: mais de maxClasses
              return (amount - subject.configuration.minConsecutiveClasses) * PONTUATION.maxClassesPenality
            }
            if(subject.configuration.preferMaxConsecutiveClasses){
              if(subject.configuration.maxConsecutiveClasses == amount){
                return PONTUATION.prefferMaxClassesReward
              }
              return PONTUATION.prefferMaxClassesPenality
            }
          }
        }
        return 0
        // TODO: pode colocar preferencia de ter max aulas aqui
      }
      for(let [d, day] of metaPhenotype.days){
        let daySchedule = classroom.schedule.get(day.id)!
        let lastSubject = {
          subjectId: -1,
          amount: 0
        }
        // RULE: Min Max Consecutive Classes
        for(let subject of daySchedule){
          if(lastSubject.subjectId == subject.id){
            lastSubject.amount += 1
          }else{
            score -= calculatePenalityScoreOfMinMaxConsecutiveClasses(this.#phenotypeProps, lastSubject.subjectId, lastSubject.amount)
            lastSubject = {
              amount: 1,
              subjectId: subject.id
            }
          }
        }
        if(lastSubject.subjectId != -1){
          score -= calculatePenalityScoreOfMinMaxConsecutiveClasses(this.#phenotypeProps, lastSubject.subjectId, lastSubject.amount)
        }
      }
    }

    return score
    // TODO:
    // - Matérias com numero correto de aulas: +H
    // - Dia sem aula: +J
    // return score
  }
}
