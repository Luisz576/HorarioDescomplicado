interface DataClassroom{
  id: number
}

interface DataDay{
  id: number
}

interface DataSubject{
  id: number
  teacherId: number
}

// META
type MetaSubject = DataSubject & {
  totalAmountOfClasses: number
}

interface MetaClassroom{
  id: number
  schedule: Map<number, DataSubject[]>
  totalAmountOfClassesBySubject: Map<number, number>
}

interface MetaDay{
  id: number
  schedule: Map<number, DataSubject[]>
}

export default class MetaScheduleOrganizerPhenotype{
  teachers = new Set<number>()
  days = new Map<number, MetaDay>()
  subjects = new Map<number, MetaSubject>
  classrooms = new Map<number, MetaClassroom>

  // add
  addCDS(classroom: DataClassroom, day: DataDay, dayTime: number, subject: DataSubject){
    // days
    if(!this.days.has(day.id)){
      this.days.set(day.id, {
         id: day.id,
         schedule: new Map()
      })
    }
    if(!this.days.get(day.id)!.schedule.has(dayTime)){
      this.days.get(day.id)!.schedule.set(dayTime, [])
    }
    this.days.get(day.id)!.schedule.get(dayTime)!.push(subject)

    // teacher
    if(subject.teacherId != -1 && !this.teachers.has(subject.teacherId)){
      this.teachers.add(subject.teacherId)
    }

    // subject
    if(!this.subjects.has(subject.id)){
      this.subjects.set(subject.id, {
        id: subject.id,
        teacherId: subject.teacherId,
        totalAmountOfClasses: 0
      })
    }
    this.subjects.get(subject.id)!.totalAmountOfClasses += 1

    // classroom
    if(!this.classrooms.has(classroom.id)){
      this.classrooms.set(classroom.id, {
        id: classroom.id,
        schedule: new Map(),
        totalAmountOfClassesBySubject: new Map(),
      })
    }

    if(!this.classrooms.get(classroom.id)!.schedule.has(day.id)){
      this.classrooms.get(classroom.id)!.schedule.set(day.id, [])
    }
    this.classrooms.get(classroom.id)!.schedule.get(day.id)!.push({
      id: subject.id,
      teacherId: subject.teacherId
    })

    if(!this.classrooms.get(classroom.id)!.totalAmountOfClassesBySubject.has(subject.id)){
      this.classrooms.get(classroom.id)!.totalAmountOfClassesBySubject.set(subject.id, 0)
    }
    let _totalAmountOfClassesBySubject = this.classrooms.get(classroom.id)!.totalAmountOfClassesBySubject.get(subject.id)!
    this.classrooms.get(classroom.id)!.totalAmountOfClassesBySubject.set(subject.id, _totalAmountOfClassesBySubject + 1)
  }
}
