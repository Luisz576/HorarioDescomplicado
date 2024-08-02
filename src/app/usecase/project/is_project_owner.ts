import IProjectRepository from "../../../core/domain/contracts/repository/iproject_repository";
import { Either, left, right } from "../../../core/types/either";

export default class IsProjectOwner{
  projectRepository
  constructor(projectRepository: IProjectRepository){
    this.projectRepository = projectRepository
  }
  async exec(projectId: number, possibleOwnerId: string): Promise<Either<any, boolean>>{
    if(projectId > 0 && possibleOwnerId){
      const res = await this.projectRepository.selectFirst({
        id: projectId
      })
      if(res.isRight()){
        if(res.value != null){
          return right(res.value.ownerId == possibleOwnerId)
        }
        return right(false)
      }
      return left(null)
    }
    return right(false)
  }
}
