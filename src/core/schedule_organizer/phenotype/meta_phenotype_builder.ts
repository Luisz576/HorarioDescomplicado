import MetaScheduleOrganizerPhenotype from "./meta_phenotype"
import ScheduleOrganizerPhenotype from "./phenotype"
import { BaseSubject, ScheduleOrganizerProps } from "../schedule_organizer_genetic"

export function getSubjectById(subjects: BaseSubject[], subjectId: number): BaseSubject | undefined{
  for(let i = 0; i < subjects.length; i++){
    if(subjects[i].id == subjectId){
      return subjects[i]
    }
  }
  return undefined
}

export function getTeacherIdOfSubject(pProps: ScheduleOrganizerProps, subjectId: number){
  for(let s in pProps.subjects){
    if(pProps.subjects[s].id == subjectId){
      return pProps.subjects[s].teacherId
    }
  }
  return -1
}

export default function metaScheduleOrganizerPhenotypeBuilder(pProps: ScheduleOrganizerProps, phenotype: ScheduleOrganizerPhenotype): MetaScheduleOrganizerPhenotype{
  let meta = new MetaScheduleOrganizerPhenotype()

  for(let c = 0; c < phenotype.classrooms.length; c++){
    let classroom = phenotype.classrooms[c]
    for(let d = 0; d < classroom.days.length; d++){
      let day = classroom.days[d]
      for(let s = 0; s < day.subjects.length; s++){
        let subject = day.subjects[s]
        meta.addCDS({
          id: c,
          realId: pProps.classrooms[c].id
        },
        {
          id: d
        },
        s,
        {
          id: subject.id,
          teacherId: getTeacherIdOfSubject(pProps, subject.id)
        })
      }
    }
  }

  return meta
}
