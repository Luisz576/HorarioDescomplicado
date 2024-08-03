import ISubjectRepository, { CreateSubjectProps, SearchSubjectQuery } from "../../core/domain/contracts/repository/isubjects_repository"
import ISubject, { FullISubject } from "../../core/domain/model/isubject"
import { Either, left, right } from "../../core/types/either"
import prisma from "../service/prisma"

class SubjectRepository implements ISubjectRepository{
  async create(props: CreateSubjectProps): Promise<Either<any, ISubject>> {
    try{
      const subjectConfiguration = await prisma.subjectConfiguration.create({
        data: {}
      })
      const subject = await prisma.subject.create({
        data: {
          name: props.name,
          projectId: props.projectId,
          subjectConfigurationId: subjectConfiguration.id
        }
      })
      return right(subject)
    }catch(e){
      return left(e)
    }
  }
  async update(targetId: number, data: Partial<ISubject>): Promise<Either<any, Boolean>> {
    try{
      await prisma.subject.update({
        data: {
          name: data.name,
          teacherId: data.teacherId ? data.teacherId : null,
        },
        where: {
          id: targetId
        }
      })
      return right(true)
    }catch(e){
      return left(e)
    }
  }
  async delete(targetId: number): Promise<Either<any, Boolean>> {
    try{
      await prisma.subject.delete({
        where: {
          id: targetId
        }
      })
      // !!!!!! TODO: remove from subject
      return right(true)
    }catch(e){
      return left(e)
    }
  }
  async deleteAllFromProject(projectId: number): Promise<Either<any, Boolean>> {
    try{
      await prisma.subject.deleteMany({
        where: {
          projectId: projectId
        }
      })
      // !!!!!! TODO: remove from subject
      return right(true)
    }catch(e){
      return left(e)
    }
  }
  async selectFirst(query: SearchSubjectQuery): Promise<Either<any, FullISubject | null>> {
    try{
      const subject: any = await prisma.subject.findFirst({
        where: query
      })
      if(!subject){
        return right(null)
      }
      const subject_configuration = await prisma.subjectConfiguration.findFirst({
        where: {
          id: subject.subjectConfigurationId
        }
      })
      if(!subject_configuration){
        return right(null)
      }
      subject.subjectConfiguration = subject_configuration
      return right(subject)
    }catch(e){
      return left(e)
    }
  }
  async selectAll(projectId: number): Promise<Either<any, FullISubject[]>> {
    try{
      const subjects: any[] = await prisma.subject.findMany({
        where: {
          projectId: projectId
        }
      })
      if(subjects.length == 0){
        return right([])
      }
      let toRemove: number[] = []
      for(let i = 0; i < subjects.length; i++){
        const subjectConfiguration = await prisma.subjectConfiguration.findFirst({
          where: {
            id: subjects[i].subjectConfigurationId
          }
        })
        if(!subjectConfiguration){
          toRemove.push(i)
          continue
        }
        subjects[i].subjectConfiguration = subjectConfiguration
      }
      for(let i in toRemove){
        subjects.splice(toRemove[i], 1)
      }
      return right(subjects)
    }catch(e){
      return left(e)
    }
  }
}

const subjectRepository = new SubjectRepository()
export default subjectRepository
