import ISubjectRepository from "../../../../core/domain/contracts/repository/isubjects_repository";
import { Either, left, right } from "../../../../core/types/either";
import DeleteClassesOfClassroomsThatContainsThisSubject from "../classrooms/delete_classes_of_classrooms_that_contains_this_subject";

export class DeleteTeacherSubjects{
  constructor(
    private subjectsRepository: ISubjectRepository,
    private deleteClassesOfClassroomsThatContainsThisSubject: DeleteClassesOfClassroomsThatContainsThisSubject
  ){}
  async exec(teacherId: number, clientId: string): Promise<Either<any, boolean>>{
    if(teacherId > 0){
      const resSubjectsToRemove = await this.subjectsRepository.selectAll({
        teacherId: teacherId
      })
      if(resSubjectsToRemove.isRight()){
        for(let i in resSubjectsToRemove.value){
          const resRemove = await this.deleteClassesOfClassroomsThatContainsThisSubject.exec(resSubjectsToRemove.value[i].id, clientId)
          if(resRemove.isLeft()){
            return left(resRemove.value)
          }
          await this.subjectsRepository.delete(resSubjectsToRemove.value[i].id)
        }
        return right(true)
      }
      return left(resSubjectsToRemove.value)
    }
    return right(false)
  }
}
