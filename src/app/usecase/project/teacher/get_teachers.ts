import ITeachersRepository from "../../../../core/domain/contracts/repository/iteachers_repository";
import ITeacher from "../../../../core/domain/model/iteacher";
import { Either, left, right } from "../../../../core/types/either";
import IsProjectOwner from "../is_project_owner";

export default class GetTeachers{
  constructor(
    private isProjectOwner: IsProjectOwner,
    private teachersRepository: ITeachersRepository
  ){}
  async exec(projectId: number, client: string): Promise<Either<any, ITeacher[]>>{
    const isPO = await this.isProjectOwner.exec(Number(projectId), client)
    if(isPO.isRight()){
      if(isPO.value){
        const resTeachers = await this.teachersRepository.selectAll(projectId)
        if(resTeachers.isRight()){
          return right(resTeachers.value)
        }
        return resTeachers
      }else{
        return right([])
      }
    }
    return left(isPO.value)
  }
}
