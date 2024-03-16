import ScheduleOrganizerPhenotype, { Day } from "./phenotype";
import { ScheduleOrganizerProps, getAcceptableSubjectId } from "../schedule_organizer_genetic"

export default function scheduleOrganizerPhenotypeInitializer(props: ScheduleOrganizerProps): ScheduleOrganizerPhenotype{
  let phenotype: ScheduleOrganizerPhenotype = {
    classrooms: []
  }

  for(let c = 0; c < props.classrooms.length; c++){
    phenotype.classrooms.push({
      days: []
    })
    for(let d = 0; d < props.days.length; d++){
      let day: Day = {
        subjects: []
      }

      for(let s = 0; s < props.days[d].classes; s++){ // fixado em 4 aulas por dia
        day.subjects.push({
          id: getAcceptableSubjectId(props, c)
        })
      }

      phenotype.classrooms[c].days.push(day)
    }
  }

  return phenotype
}
