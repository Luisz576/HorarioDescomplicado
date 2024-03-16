export interface Subject{
  id: number
}

export interface Day{
  // dayOfWeek: DayOfWeek
  subjects: Subject[]
}

export interface Classroom{
  days: Day[]
}

export default interface ScheduleOrganizerPhenotype{
  classrooms: Classroom[]
}

export const freeClassId = -1

export function phenotypeToString(phenotype: ScheduleOrganizerPhenotype): string{
  let coded = ""
  for(let c = 0; c < phenotype.classrooms.length; c++){
    for(let d = 0; d < phenotype.classrooms[c].days.length; d++){
      for(let s = 0; s < phenotype.classrooms[c].days[d].subjects.length; s++){
        if(coded.length > 0){
          coded += '.'
        }
        coded += phenotype.classrooms[c].days[d].subjects[s]
      }
    }
  }
  return coded
}

// export function stringToPhenotype(str: string, props: ): ScheduleOrganizerPhenotype{

// }
