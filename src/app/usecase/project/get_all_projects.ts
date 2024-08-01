import IProject from "../../../core/domain/model/iproject"
import IProjectRepository from "../../../core/domain/contracts/repository/iproject_repository"
import projectRepository from "../../repository/project_repository"
import { Either, left } from "../../../core/types/either"

interface GetAllProjectsProps{
  ownerId: string
}

class GetAllProjects{
  constructor(
    private projectRepository: IProjectRepository,
  ){}
  async exec(props: GetAllProjectsProps): Promise<Either<any, IProject[]>>{
    if(props.ownerId && props.ownerId.trim() != ""){
      props.ownerId = props.ownerId.trim()
      return await this.projectRepository.selectAll({
        ownerId: props.ownerId
      })
    }
    return left(null)
  }
}

const getAllProjects = new GetAllProjects(
  projectRepository
)
export default getAllProjects
