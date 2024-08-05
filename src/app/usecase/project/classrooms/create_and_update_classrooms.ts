import IClassroomsRepository from "../../../../core/domain/contracts/repository/iclassrooms_repository";
import { FullIClassroom, IClassroomSubject } from "../../../../core/domain/model/iclassroom";
import { Either, left, right } from "../../../../core/types/either";
import IsProjectOwner from "../is_project_owner";
import GetClassrooms from "./get_classrooms";

export type ClassroomData = Omit<FullIClassroom, 'id' | 'projectId' | 'subjects'>
  & Partial<{
    id: number,
    acceptedSubjects: Omit<IClassroomSubject, 'classroomId'>[]
  }>

export default class CreateAndUpdateClassrooms{
  constructor(
    private isProjectOwner: IsProjectOwner,
    private classroomsRepository: IClassroomsRepository,
    private getClassrooms: GetClassrooms
  ){}
  async exec(projectId: number, clientId: string, classrooms: ClassroomData[]): Promise<Either<any, boolean>>{
    const isPO = await this.isProjectOwner.exec(Number(projectId), clientId)
    if(isPO.isRight()){
      if(isPO.value){
        const resSavedClassrooms = await this.getClassrooms.exec(projectId, clientId)
        if(resSavedClassrooms.isRight()){
          const savedClassrooms = resSavedClassrooms.value
          // update existing
          for(let i in savedClassrooms){
            let classroomUpdated = false
            for(let c = 0; c < classrooms.length; c++){
              if(classrooms[c].id == savedClassrooms[i].id){
                classroomUpdated = true
                // ignora os -1
                const acceptedSubjects: Omit<IClassroomSubject, 'classroomId'>[] = []
                for(let x in classrooms[c].acceptedSubjects){
                  if(classrooms[c].acceptedSubjects[x].subjectId != -1){
                    let classes = classrooms[c].acceptedSubjects[x].classes
                    if(classes < 0){
                      classes = 1
                    }
                    acceptedSubjects.push({
                      subjectId: classrooms[c].acceptedSubjects[x].subjectId,
                      classes: classes
                    })
                  }
                }
                // compare with saved
                for(let sas in savedClassrooms[i].acceptedSubjects){
                  let needRemove = true
                  for(let x in classrooms[c].acceptedSubjects){
                    if(savedClassrooms[i].acceptedSubjects[sas].subjectId == classrooms[c].acceptedSubjects[x].subjectId){
                      needRemove = false
                      break
                    }
                  }
                  if(needRemove){
                    const resRemoveAcceptedSubject = await this.classroomsRepository.deleteAcceptedSubject(savedClassrooms[i].id, savedClassrooms[i].acceptedSubjects[sas].subjectId)
                    if(resRemoveAcceptedSubject.isLeft()){
                      return left(resRemoveAcceptedSubject.value)
                    }
                  }
                }
                // ------------------
                const resUpdate = await this.classroomsRepository.update(savedClassrooms[i].id, {
                  name: classrooms[c].name.trim(),
                  acceptedSubjects: acceptedSubjects.length > 0 ? acceptedSubjects : undefined
                })
                if(resUpdate.isLeft()){
                  return left(resUpdate.value) // error
                }

                classrooms.splice(c, 1)
                break
              }
            }
            if(!classroomUpdated){
              const resRemove = await this.classroomsRepository.delete(savedClassrooms[i].id)
              if(resRemove.isLeft()){
                return left(resRemove.value)
              }
            }
          }
          // create others
          for(let c in classrooms){
            const subjects: Omit<IClassroomSubject, 'classroomId'>[] = []
            for(let i in classrooms[c].acceptedSubjects){
              if(classrooms[c].acceptedSubjects[i].subjectId != -1){
                let classes = classrooms[c].acceptedSubjects[i].classes
                if(classes < 0){
                  classes = 1
                }
                subjects.push({
                  subjectId: classrooms[c].acceptedSubjects[i].subjectId,
                  classes: classes
                })
              }
            }
            const resCreate = await this.classroomsRepository.create({
              name: classrooms[c].name,
              projectId: projectId,
              subjects: subjects.length == 0 ? undefined : subjects
            })
            if(resCreate.isLeft()){
              return left(resCreate.value)
            }
          }
          return right(true)
        }
        return left(resSavedClassrooms.value)
      }
      return right(false)
    }
    return isPO
  }
}
