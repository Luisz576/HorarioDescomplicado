import Genetic, { GeneticConfiguration } from "../../lib/genetic/genetic"
import IGeneticConfiguration, { StopMethod } from "../domain/model/configuration/igenetic_configuration"
import ScheduleOrganizerPhenotype from "./phenotype"
import scheduleOrganizerPhenotypeInitializer from "./phenotype_initializer"
import { DayOfWeek } from "../utils/utils"
import ISubjectConfiguration from "../domain/model/configuration/isubject_configuration"
import randomInt from "../utils/random_int"
import cloneJson from "../utils/clone_json"
import PONTUATION from "./pontuation"

export interface BaseSubject{
  id: number
  teacherId: number
  configuration: ISubjectConfiguration
}
export interface ScheduleOrganizerProps{
  classrooms: {
    days: DayOfWeek[],
    acceptedSubjects: {
      subjectId: number
      classes: number
    }[]
  }[],
  teachers: {
    id: number
    // schedule: Time[]
  }[]
  subjects: BaseSubject[]
}

export function getSubjectById(subjects: BaseSubject[], subjectId: number): BaseSubject | undefined{
  for(let i = 0; i < subjects.length; i++){
    if(subjects[i].id == subjectId){
      return subjects[i]
    }
  }
  return undefined
}

export function getAcceptableSubjectId(pProps: ScheduleOrganizerProps, classId: number, canBeEmpty = true, maxIter = -1): number{
  if(canBeEmpty && Math.random() < 0.2){
    return -1
  }

  let acceptables = []
  for(let a = 0; a < pProps.classrooms[classId].acceptedSubjects.length; a++){
    acceptables.push(pProps.classrooms[classId].acceptedSubjects[a].subjectId)
  }

  let i = 0
  let randSubjectId = -1
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
  return -1
}

export default class ScheduleOrganizerGenetic{
  #g: Genetic<ScheduleOrganizerPhenotype>
  #phenotypeProps: ScheduleOrganizerProps
  #teacherMeta: any

  #stopMethod: StopMethod
  #maxOrWithoutBetterGenerations: number

  #currentGeneration: number = 1
  #generationsWithoutBetter: number = 0
  #bestPhenotypeScore: number = Number.NEGATIVE_INFINITY

  #bestPhenotype: ScheduleOrganizerPhenotype | undefined

  #buildTeacherMeta(): {}{
    let t: any = {}
    for(let i = 0; i < this.#phenotypeProps.subjects.length; i++){
      let s = this.#phenotypeProps.subjects[i]
      if(!(s.teacherId in t)){
        t[`${s.teacherId}`] = []
      }
      t[`${s.teacherId}`].push(s.id)
    }
    return t
  }

  constructor(phenotypeProps: ScheduleOrganizerProps, geneticConfiguration: Omit<IGeneticConfiguration, 'id'>){
    this.#phenotypeProps = phenotypeProps
    this.#stopMethod = geneticConfiguration.stopMethod
    this.#maxOrWithoutBetterGenerations = geneticConfiguration.maxOrWithoutBetterGenerations
    this.#teacherMeta = this.#buildTeacherMeta()
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

    let metaPhenotype: any = {
      classrooms: {},
      teachers: [],
      subjects: {
        ids: []
      },
      day: {
        size: 0
      }
    }
    // build meta
    for(let c = 0; c < phenotype.classrooms.length; c++){
      metaPhenotype.classrooms[`${c}`] = {
        subjects: {}
      }
      for(let d = 0; d < phenotype.classrooms[c].days.length; d++){
        metaPhenotype.classrooms[`${c}`][`${d}`] = {}

        if(!(`${d}` in metaPhenotype.day)){
          metaPhenotype.day[`${d}`] = {
            subjectsBlocks: {
              size: 0
            }
          }
          metaPhenotype.day.size += 1
        }

        for(let s = 0; s < phenotype.classrooms[c].days[d].subjects.length; s++){
          if(!(`${s}` in metaPhenotype.day[`${d}`].subjectsBlocks)){
            metaPhenotype.day[`${d}`].subjectsBlocks[`${s}`] = []
            metaPhenotype.day[`${d}`].subjectsBlocks.size += 1
          }

          let sId = phenotype.classrooms[c].days[d].subjects[s].id
          if(sId == -1){
            // REGRA: - Aula vazia
            score -= PONTUATION.emptyClassPenality
          }else{
            if(!(metaPhenotype.subjects.ids.includes(sId))){
              metaPhenotype.subjects.ids.push([sId])
            }

            // salva quantidade total por classe
            if(!(`${sId}` in metaPhenotype.classrooms[`${c}`].subjects)){
              metaPhenotype.classrooms[`${c}`].subjects[`${sId}`] = 0
            }
            metaPhenotype.classrooms[`${c}`].subjects[`${sId}`] += 1

            // salva quantidade de aulas no dia
            if(`${sId}` in metaPhenotype.classrooms[`${c}`][`${d}`]){
              metaPhenotype.classrooms[`${c}`][`${d}`][`${sId}`] += 1
            }else{
              metaPhenotype.classrooms[`${c}`][`${d}`][`${sId}`] = 1
            }
            metaPhenotype.day[`${d}`].subjectsBlocks[`${s}`].push(sId)
          }
        }
      }
    }

    // teacherScore
    for(let t = 0; t < this.#phenotypeProps.teachers.length; t++){
      let tId = this.#phenotypeProps.teachers[t].id

      for(let d = 0; d < metaPhenotype.day.size; d++){
        for(let s = 0; s < metaPhenotype.day[`${d}`].subjectsBlocks.size; s++){
          let classesAtSameTime = 0

          // pega bloco do dia por bloco do dia
          let subjectsBlock = metaPhenotype.day[`${d}`].subjectsBlocks[s]
          for(let sb = 0; sb < subjectsBlock.length; sb++){
            let sId = subjectsBlock[sb]
            if(this.#teacherMeta[`${tId}`].includes(sId)){
              classesAtSameTime += 1
            }
          }

          // REGRA: - Prof em mais de uma aula na mesma hora
          score -= (Math.max(classesAtSameTime - 1, 0)) * PONTUATION.classesAtSameTimePenality
        }
      }
    }
    // subjects score
    for(let s = 0; s < metaPhenotype.subjects.ids.length; s++){
      let sId = metaPhenotype.subjects.ids[s]
      for(let c = 0; c < phenotype.classrooms.length; c++){
        let sClasses = -1
        for(let ac = 0; ac < this.#phenotypeProps.classrooms[`${c}`].acceptedSubjects.length; ac++){
          if(this.#phenotypeProps.classrooms[`${c}`].acceptedSubjects[ac].subjectId){
            sClasses = this.#phenotypeProps.classrooms[`${c}`].acceptedSubjects[ac].classes
          }
        }

        if(sClasses != -1 &&
            (metaPhenotype.classrooms[`${c}`].subjects[`${sId}`] < sClasses ||
            metaPhenotype.classrooms[`${c}`].subjects[`${sId}`] > sClasses)
          ){
            let dif = Math.abs(metaPhenotype.classrooms[`${c}`].subjects[`${sId}`] - sClasses)
            // Regra: Matéria sem as aulas certinho: -E * nAulasFaltantes
            score -= dif * PONTUATION.differentAmountOfClassesPenality
        }
      }
    }

    // TODO:
    // - Matéria com mais aula seguida que a max: -C * nAulasAMais
    // - Matéria prefere max aula seguida mas não está: -D
    // - Matéria com menos aulas do que o min class: -F

    // - Prof prefere max aula seguida e esta: +G
    // - Matérias com numero correto de aulas: +H
    // - Dia sem aula: +J
    return score
  }
}
