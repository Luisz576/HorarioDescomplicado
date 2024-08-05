import { Either } from "../../../types/either"
import IClassroom, { FullIClassroom, IClassroomSubject } from "../../model/iclassroom"

export type CreateClassroomProps = Omit<IClassroom, 'id'> & { subjects: Omit<IClassroomSubject, 'classroomId'>[] | undefined }
export type SearchSubjectQuery = Partial<IClassroom>

export default interface IClassroomsRepository{
  deleteAcceptedSubject(classroomId: number, subjectId: number): Promise<Either<any, boolean>>
  create(props: CreateClassroomProps): Promise<Either<any, IClassroom>>
  update(targetId: number, data: Partial<FullIClassroom>): Promise<Either<any, Boolean>>
  delete(targetId: number): Promise<Either<any, Boolean>>
  deleteAllFromProject(projectId: number): Promise<Either<any, Boolean>>
  selectFirst(query: SearchSubjectQuery): Promise<Either<any, FullIClassroom | null>>
  selectAll(query: SearchSubjectQuery): Promise<Either<any, FullIClassroom[]>>
}
