import { Either } from "../../../types/either"
import ISubject, { FullISubject } from "../../model/isubject"

export type CreateSubjectProps = Omit<Omit<Omit<ISubject, 'id'>, 'subjectConfigurationId'>, 'teacherId'> & { teacherId: number | null }

export type SearchSubjectQuery = Partial<ISubject>

export default interface ISubjectRepository{
  create(props: CreateSubjectProps): Promise<Either<any, ISubject>>
  update(targetId: number, data: Partial<FullISubject>): Promise<Either<any, Boolean>>
  delete(targetId: number): Promise<Either<any, Boolean>>
  deleteAllFromProject(projectId: number): Promise<Either<any, Boolean>>
  selectFirst(query: SearchSubjectQuery): Promise<Either<any, FullISubject | null>>
  selectAll(query: SearchSubjectQuery): Promise<Either<any, FullISubject[]>>
}
