import IClassroomsRepository, { CreateClassroomProps, SearchSubjectQuery } from "../../core/domain/contracts/repository/iclassrooms_repository";
import IClassroom, { FullIClassroom, IClassroomSubject } from "../../core/domain/model/iclassroom";
import { Either, left, right } from "../../core/types/either";
import prisma from "../service/prisma";

class ClassroomsRepository implements IClassroomsRepository{
  async create(props: CreateClassroomProps): Promise<Either<any, IClassroom>> {
    try{
      const classroom = await prisma.classroom.create({
        data: {
          name: props.name,
          projectId: props.projectId,
        }
      })
      if(props.subjects){
        for(let s in props.subjects){
          await prisma.classroomSubject.create({
            data: {
              classroomId: classroom.id,
              subjectId: props.subjects[s].subjectId,
              classes: props.subjects[s].classes
            }
          })
        }
      }
      return right(classroom)
    }catch(e){
      return left(e)
    }
  }
  async update(targetId: number, data: Partial<FullIClassroom>): Promise<Either<any, Boolean>> {
    try{
      await prisma.classroom.update({
        data: {
          name: data.name
        },
        where: {
          id: targetId
        }
      })
      if(data.acceptedSubjects){
        for(let s in data.acceptedSubjects){
          const aS = await prisma.classroomSubject.findFirst({
            where: {
              classroomId: targetId,
              subjectId: data.acceptedSubjects[s].subjectId
            }
          })
          if(aS == null){
            await prisma.classroomSubject.create({
              data: {
                classroomId: targetId,
                subjectId: data.acceptedSubjects[s].subjectId,
                classes: data.acceptedSubjects[s].classes
              }
            })
          }else{
            await prisma.classroomSubject.update({
              data: {
                classes: data.acceptedSubjects[s].classes
              },
              where: {
                id: aS.id
              }
            })
          }
        }
      }
      return right(true)
    }catch(e){
      return left(e)
    }
  }
  async delete(targetId: number): Promise<Either<any, Boolean>> {
    try{
      await prisma.classroomSubject.deleteMany({
        where: {
          classroomId: targetId
        }
      })
      await prisma.classroom.delete({
        where: {
          id: targetId
        }
      })
      return right(true)
    }catch(e){
      return left(e)
    }
  }
  async deleteAllFromProject(projectId: number): Promise<Either<any, Boolean>> {
    try{
      const projectsToDelete = await this.selectAll({
        projectId: projectId
      })
      if(projectsToDelete.isLeft()){
        for(let p in projectsToDelete.value){
          await prisma.classroomSubject.deleteMany({
            where: {
              classroomId: projectsToDelete.value[p].id
            }
          })
        }
        await prisma.classroom.deleteMany({
          where: {
            projectId: projectId
          }
        })
        return right(true)
      }
      return projectsToDelete
    }catch(e){
      return left(e)
    }
  }
  async selectFirst(query: SearchSubjectQuery): Promise<Either<any, FullIClassroom | null>> {
    try{
      const classroomBase = await prisma.classroom.findFirst({
        where: query
      })
      if(classroomBase == null){
        return right(null)
      }
      const subjects = await prisma.classroomSubject.findMany({
        where: {
          classroomId: classroomBase.id
        }
      })
      const classroom = {
        id: classroomBase.id,
        name: classroomBase.name,
        projectId: classroomBase.projectId,
        acceptedSubjects: subjects
      }
      return right(classroom)
    }catch(e){
      return left(e)
    }
  }
  async selectAll(query: SearchSubjectQuery): Promise<Either<any, FullIClassroom[]>> {
    try{
      const classroomsBase = await prisma.classroom.findMany({
        where: query
      })
      const classrooms: FullIClassroom[] = []
      for(let c in classroomsBase){
        const subjects = await prisma.classroomSubject.findMany({
          where: {
            classroomId: classroomsBase[c].id
          }
        })
        classrooms.push({
          id: classroomsBase[c].id,
          name: classroomsBase[c].name,
          projectId: classroomsBase[c].projectId,
          acceptedSubjects: subjects
        })
      }
      return right(classrooms)
    }catch(e){
      return left(e)
    }
  }
  async deleteAcceptedSubject(classroomId: number, subjectId: number): Promise<Either<any, boolean>> {
    try{
      await prisma.classroomSubject.deleteMany({
        where: {
          classroomId: classroomId,
          subjectId: subjectId
        }
      })
      return right(true)
    }catch(e){
      return left(e)
    }
  }
}

const classroomsRepository = new ClassroomsRepository()
export default classroomsRepository
