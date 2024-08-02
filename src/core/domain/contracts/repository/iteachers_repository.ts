import { Either } from "../../../types/either"
import ITeacher from "../../model/iteacher"

export type CreateTeacherProps = Omit<ITeacher, 'id'>

export type SearchTeacherQuery = Partial<ITeacher>

export default interface ITeachersRepository{
  create(props: CreateTeacherProps): Promise<Either<any, ITeacher>>
  update(targetId: number, data: Partial<ITeacher>): Promise<Either<any, Boolean>>
  delete(targetId: number): Promise<Either<any, Boolean>>
  deleteAllFromProject(projectId: number): Promise<Either<any, Boolean>>
  selectFirst(query: SearchTeacherQuery): Promise<Either<any, ITeacher | null>>
  selectAll(projectId: number): Promise<Either<any, ITeacher[]>>
}
