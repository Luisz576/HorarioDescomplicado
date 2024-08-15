import IsProjectOwner from "../is_project_owner";
import { Either, left, right } from "../../../../core/types/either";
import GetSubjects from "./get_subjects";
import ISubjectRepository from "../../../../core/domain/contracts/repository/isubjects_repository";
import ISubject, { SubjectConfiguration } from "../../../../core/domain/model/isubject";
import DeleteClassesOfClassroomsThatContainsThisSubject from "../classrooms/delete_classes_of_classrooms_that_contains_this_subject";

export type SubjectData = Omit<ISubject, 'id' | 'projectId' | 'subjectConfigurationId'> & Partial<{
  id: number,
  subjectConfiguration: SubjectConfiguration
}>

export default class CreateAndUpdateSubjects{
  constructor(
    private isProjectOwner: IsProjectOwner,
    private subjectRepository: ISubjectRepository,
    private getSubjects: GetSubjects,
    private deleteClassesOfClassroomsThatContainsThisSubject: DeleteClassesOfClassroomsThatContainsThisSubject
  ){}
  async exec(projectId: number, client: string, subjects: SubjectData[]) : Promise<Either<any, boolean>>{
    const isPO = await this.isProjectOwner.exec(Number(projectId), client)
    if(isPO.isRight()){
      if(isPO.value){
        const resSavedSubjects = await this.getSubjects.exec(projectId, client)
        if(resSavedSubjects.isRight()){
          const savedSubjects = resSavedSubjects.value
          // update existing
          for(let i in savedSubjects){
            let subjectUpdated = false
            for(let t = 0; t < subjects.length; t++){
              if(subjects[t].id == savedSubjects[i].id){
                subjectUpdated = true
                const newSubjectName = subjects[t].name.trim()
                const newTeacherId = subjects[t].teacherId
                const newSubjectConfiguration = (subjects[t].subjectConfiguration && ( // CONFIG
                  savedSubjects[i].subjectConfiguration.maxConsecutiveClasses != subjects[t].subjectConfiguration!.maxConsecutiveClasses ||
                  savedSubjects[i].subjectConfiguration.minConsecutiveClasses != subjects[t].subjectConfiguration!.minConsecutiveClasses ||
                  savedSubjects[i].subjectConfiguration.preferMaxConsecutiveClasses != subjects[t].subjectConfiguration!.preferMaxConsecutiveClasses
                ))
                if(
                  savedSubjects[i].name != newSubjectName
                  || savedSubjects[i].teacherId != newTeacherId
                  || newSubjectConfiguration
                ){
                  const resUpdate = await this.subjectRepository.update(savedSubjects[i].id, {
                    name: newSubjectName,
                    teacherId: newTeacherId,
                    subjectConfiguration: newSubjectConfiguration ? subjects[t].subjectConfiguration : undefined
                  })
                  if(resUpdate.isLeft()){
                    return left(resUpdate.value) // error
                  }
                }
                subjects.splice(t, 1)
                break
              }
            }
            if(!subjectUpdated){
              const resRemoveClasses = await this.deleteClassesOfClassroomsThatContainsThisSubject.exec(savedSubjects[i].id, client)
              if(resRemoveClasses.isLeft()){
                return left(resRemoveClasses.value)
              }
              const resRemove = await this.subjectRepository.delete(savedSubjects[i].id)
              if(resRemove.isLeft()){
                return left(resRemove.value)
              }
            }
          }
          // create others
          for(let t in subjects){
            const resCreate = await this.subjectRepository.create({
              name: subjects[t].name,
              projectId: projectId,
              teacherId: subjects[t].teacherId
            })
            if(resCreate.isLeft()){
              return left(resCreate.value)
            }
          }
          return right(true)
        }
        return left(resSavedSubjects.value)
      }else{
        return right(false)
      }
    }
    return left(isPO.value)
  }
}
