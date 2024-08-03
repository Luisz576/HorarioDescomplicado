import ISubjectRepository from "../../../../core/domain/contracts/repository/isubjects_repository";
import ISubject, { FullISubject } from "../../../../core/domain/model/isubject";
import { Either, left, right } from "../../../../core/types/either";
import IsProjectOwner from "../is_project_owner";

export default class GetSubjects{
  constructor(
    private isProjectOwner: IsProjectOwner,
    private subjectRepository: ISubjectRepository
  ){}
  async exec(projectId: number, client: string): Promise<Either<any, FullISubject[]>>{
    const isPO = await this.isProjectOwner.exec(Number(projectId), client)
    if(isPO.isRight()){
      if(isPO.value){
        const resSubjects = await this.subjectRepository.selectAll(projectId)
        if(resSubjects.isRight()){
          return right(resSubjects.value)
        }
        return resSubjects
      }else{
        return right([])
      }
    }
    return left(isPO.value)
  }
}
