import ScheduleOrganizerPhenotype, { Day } from "./phenotype";
import { ScheduleOrganizerProps, getAcceptableSubject } from "./schedule_organizer_genetic"

export default function scheduleOrganizerPhenotypeInitializer(props: ScheduleOrganizerProps): ScheduleOrganizerPhenotype{
  let phenotype: ScheduleOrganizerPhenotype = {
    classrooms: []
  }

  for(let c = 0; c < props.classrooms.length; c++){
    for(let i = 0; i < props.classrooms[c].days.length; i++){
      let day: Day = {
        subjects: []
      }

      for(let a = 0; a < 4; a++){ // fixado em 4 aulas por dia
        day.subjects.push(props.subjects[getAcceptableSubject(props, c)])
      }

      phenotype.classrooms[c].days.push(day)
    }
  }

  return phenotype
}
