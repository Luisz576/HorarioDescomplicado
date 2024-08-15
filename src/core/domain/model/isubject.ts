export default interface ISubject{
  id: number
  name: string
  teacherId: number | null
  projectId: number
  subjectConfigurationId: number
}

export interface SubjectConfiguration {
  id: number
  minConsecutiveClasses: number
  maxConsecutiveClasses: number
  preferMaxConsecutiveClasses: boolean
}

export type FullISubject = {
  id: number
  name: string
  teacherId: number | null
  projectId: number
  subjectConfiguration: SubjectConfiguration
}

export type PartialFullISubject = Partial<{
  id: number
  name: string
  teacherId: number
  projectId: number
  subjectConfiguration: Partial<SubjectConfiguration>
}>
