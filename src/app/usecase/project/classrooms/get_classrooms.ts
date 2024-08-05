import IClassroomsRepository from "../../../../core/domain/contracts/repository/iclassrooms_repository";
import { FullIClassroom } from "../../../../core/domain/model/iclassroom";
import { Either, left, right } from "../../../../core/types/either";
import IsProjectOwner from "../is_project_owner";

export default class GetClassrooms{
  constructor(
    private isProjectOwner: IsProjectOwner,
    private classroomsRepository: IClassroomsRepository
  ){}
  async exec(projectId: number, clientId: string) : Promise<Either<any, FullIClassroom[]>>{
    const isPO = await this.isProjectOwner.exec(Number(projectId), clientId)
    if(isPO.isRight()){
      if(isPO.value){
        const resClassrooms = await this.classroomsRepository.selectAll({
          projectId: projectId
        })
        if(resClassrooms.isRight()){
          return right(resClassrooms.value)
        }
        return resClassrooms
      }else{
        return right([])
      }
    }
    return left(isPO.value)
  }
}
