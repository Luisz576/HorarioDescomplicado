import { Either } from "../../utils/either"
import IProject from "../model/iproject"

export type CreateProjectProps = Omit<IProject, 'id'>

export type SearchProjectQuery = Partial<IProject>

export default interface IProjectRepository{
  create(props: CreateProjectProps): Promise<Either<any, IProject>>
  update(targetId: number, data: Partial<IProject>): Promise<Either<any, Boolean>>
  delete(targetId: number): Promise<Either<any, Boolean>>
  selectFirst(query: SearchProjectQuery): Promise<Either<any, IProject | null>>
  selectAll(query: SearchProjectQuery): Promise<Either<any, IProject[]>>
}
