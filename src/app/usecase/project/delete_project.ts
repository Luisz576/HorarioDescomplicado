import IProjectRepository from "../../../core/domain/repository/iproject_repository"
import projectRepository from "../../repository/project_repository"
import { Either, left, right } from "../../../core/utils/either"

class DeleteProject{
  constructor(
    private projectRepository: IProjectRepository,
  ){}
  async exec(targetId: number): Promise<Either<any, boolean>>{
    if(targetId && targetId > 0){
      const res = await this.projectRepository.delete(targetId)
      if(res.isRight()){
        return right(true)
      }
      return left(res.value)
    }
    return left(null)
  }
}

const deleteProject = new DeleteProject(
  projectRepository
)
export default deleteProject
