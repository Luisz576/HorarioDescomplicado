import IClassroomsRepository from "../../../../core/domain/contracts/repository/iclassrooms_repository";
import ISubjectRepository from "../../../../core/domain/contracts/repository/isubjects_repository";
import { Either, left, right } from "../../../../core/types/either";
import CreateAndUpdateClassrooms from "./create_and_update_classrooms";

export default class DeleteClassesOfClassroomsThatContainsThisSubject{
  constructor(
    private subjectsRepository: ISubjectRepository,
    private classroomsRepository: IClassroomsRepository,
    private createAndUpdateClassrooms: CreateAndUpdateClassrooms,
  ){}
  async exec(subjectId: number, clientId: string): Promise<Either<any, boolean>>{
    if(subjectId > 0){
      const resSubject = await this.subjectsRepository.selectFirst({
        id: subjectId
      })
      if(resSubject.isRight()){
        if(resSubject.value == null){
          return right(false)
        }
        const resClassrooms = await this.classroomsRepository.selectAll({
          projectId: resSubject.value.projectId
        })
        if(resClassrooms.isRight()){
          const classrooms = resClassrooms.value
          for(let c in classrooms){
            for(let i = 0; i < classrooms[c].acceptedSubjects.length; i++){
              if(classrooms[c].acceptedSubjects[i].subjectId == subjectId){
                classrooms[c].acceptedSubjects.splice(i, 1)
              }
            }
          }
          const r = await this.createAndUpdateClassrooms.exec(resSubject.value.projectId, clientId, classrooms)
          if(r.isLeft()){
            return left(r.value)
          }
          return right(true)
        }
        return left(resClassrooms.value)
      }
      return left(resSubject.value)
    }
    return right(false)
  }
}
