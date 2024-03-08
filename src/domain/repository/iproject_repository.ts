import { Either } from "../../core/utils/either"
import IProject from "../model/iproject"

export interface CreateProjectProps{
  name: string
  configurationId: string
}

export default interface IProjectRepository{
  create(props: CreateProjectProps): Promise<Either<any, IProject>>
  delete(): Promise<Either<any, Boolean>>
}
