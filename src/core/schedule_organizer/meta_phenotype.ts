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

export default class MetaScheduleOrganizerPhenotype{
  getSubjectStatistics(subjectId: number): {
    id: number
  }{
    return {
      id: subjectId
    }
  }

  // add
  addCDS(classroom: DataClassroom, day: DataDay, subject: DataSubject){

  }
}
