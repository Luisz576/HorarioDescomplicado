import { Either } from "../../utils/either"
import IProject from "../model/iproject"

export interface CreateProjectProps{
  name: string
  configurationId: number
}

export default interface IProjectRepository{
  create(props: CreateProjectProps): Promise<Either<any, IProject>>
  update(targetId: number, data: Partial<IProject>): Promise<Either<any, Boolean>>
  delete(targetId: number): Promise<Either<any, Boolean>>
}
