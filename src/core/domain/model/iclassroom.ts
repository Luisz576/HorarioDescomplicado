export default interface IClassroom{
  id: number
  name: string
  projectId: number
}

export interface FullIClassroom{
  id: number
  name: string
  projectId: number
  acceptedSubjects: Omit<IClassroomSubject, 'classroomId'>[]
}

export interface IClassroomSubject{
  classroomId: number
  subjectId: number
  classes: number
}
