import { FullISubject } from "../../core/domain/model/isubject";
import { BaseSubject } from "../../core/schedule_organizer/schedule_organizer_genetic";

export function subjectToBaseSubject(subject: FullISubject): BaseSubject{
  if(subject.teacherId == null){
    throw "All subjects need to have a 'TeacherId'"
  }
  return {
    id: subject.id,
    teacherId: subject.teacherId,
    configuration: {
      maxConsecutiveClasses: subject.subjectConfiguration.maxConsecutiveClasses,
      minConsecutiveClasses: subject.subjectConfiguration.minConsecutiveClasses,
      preferMaxConsecutiveClasses: subject.subjectConfiguration.preferMaxConsecutiveClasses
    },
  }
}
