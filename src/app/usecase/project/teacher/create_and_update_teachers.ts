import { Teacher } from "@prisma/client";
import ITeachersRepository from "../../../../core/domain/contracts/repository/iteachers_repository";
import IsProjectOwner from "../is_project_owner";
import { Either, left, right } from "../../../../core/types/either";

export type TeacherData = Omit<Teacher, 'id' | 'projectId'> & Partial<{id: number}>

export default class CreateAndUpdateTeachers{
  constructor(
    private isProjectOwner: IsProjectOwner,
    private teachersRepository: ITeachersRepository
  ){}
  async exec(projectId: number, client: string, teachers: TeacherData[]) : Promise<Either<any, boolean>>{
    const isPO = await this.isProjectOwner.exec(Number(projectId), client)
    if(isPO.isRight()){
      if(isPO.value){
        // TODO
        console.log(teachers)
      }else{
        return right(false)
      }
    }
    return left(isPO.value)
  }
}
