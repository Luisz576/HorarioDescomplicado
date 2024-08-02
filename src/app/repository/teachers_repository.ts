import ITeachersRepository, { CreateTeacherProps, SearchTeacherQuery } from "../../core/domain/contracts/repository/iteachers_repository";
import ITeacher from "../../core/domain/model/iteacher";
import { Either, left, right } from "../../core/types/either";
import prisma from "../service/prisma";

class TeachersRepository implements ITeachersRepository{
  async create(props: CreateTeacherProps): Promise<Either<any, ITeacher>> {
    try{
      const teachers = await prisma.teacher.create({
        data: {
          name: props.name,
          projectId: props.projectId
        }
      })
      return right(teachers)
    }catch(e){
      return left(e)
    }
  }
  async update(targetId: number, data: Partial<ITeacher>): Promise<Either<any, Boolean>> {
    try{
      await prisma.teacher.update({
        data: {
          name: data.name
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
      await prisma.teacher.delete({
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
      await prisma.teacher.deleteMany({
        where: {
          projectId: projectId
        }
      })
      return right(true)
    }catch(e){
      return left(e)
    }
  }
  async selectFirst(query: SearchTeacherQuery): Promise<Either<any, ITeacher | null>> {
    try{
      const teachers = await prisma.teacher.findFirst({
        where: query
      })
      return right(teachers)
    }catch(e){
      return left(e)
    }
  }
  async selectAll(projectId: number): Promise<Either<any, ITeacher[]>> {
    try{
      const teachers = await prisma.teacher.findMany({
        where: {
          projectId: projectId
        }
      })
      return right(teachers)
    }catch(e){
      return left(e)
    }
  }
}

const teachersRepository = new TeachersRepository()
export default teachersRepository
