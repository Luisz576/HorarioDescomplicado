import { Teacher } from "@prisma/client";
import ITeachersRepository from "../../../../core/domain/contracts/repository/iteachers_repository";
import IsProjectOwner from "../is_project_owner";
import { Either, left, right } from "../../../../core/types/either";
import GetTeachers from "./get_teachers";

export type TeacherData = Omit<Teacher, 'id' | 'projectId'> & Partial<{id: number}>

export default class CreateAndUpdateTeachers{
  constructor(
    private isProjectOwner: IsProjectOwner,
    private teachersRepository: ITeachersRepository,
    private getTeachers: GetTeachers,
  ){}
  async exec(projectId: number, client: string, teachers: TeacherData[]) : Promise<Either<any, boolean>>{
    const isPO = await this.isProjectOwner.exec(Number(projectId), client)
    if(isPO.isRight()){
      if(isPO.value){
        const resSavedTeachers = await this.getTeachers.exec(projectId, client)
        if(resSavedTeachers.isRight()){
          const savedTeachers = resSavedTeachers.value
          // update existing
          for(let i in savedTeachers){
            let teacherUpdated = false
            for(let t = 0; t < teachers.length; t++){
              if(teachers[t].id == savedTeachers[i].id){
                teacherUpdated = true
                const newTeacherName = teachers[t].name.trim()
                if(savedTeachers[i].name != newTeacherName){
                  const resUpdate = await this.teachersRepository.update(savedTeachers[i].id, {
                    name: newTeacherName
                  })
                  if(resUpdate.isLeft()){
                    return left(resUpdate.value) // error
                  }
                }
                teachers.splice(t, 1)
                break
              }
            }
            if(!teacherUpdated){
              const resRemove = await this.teachersRepository.delete(savedTeachers[i].id)
              if(resRemove.isLeft()){
                return left(resRemove.value)
              }
            }
          }
          // create others
          for(let t in teachers){
            const resCreate = await this.teachersRepository.create({
              name: teachers[t].name,
              projectId: projectId
            })
            if(resCreate.isLeft()){
              return left(resCreate.value)
            }
          }
          return right(true)
        }
        return left(resSavedTeachers.value)
      }else{
        return right(false)
      }
    }
    return left(isPO.value)
  }
}
