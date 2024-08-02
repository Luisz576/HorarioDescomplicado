import ITeachersRepository, { CreateTeacherProps, SearchTeacherQuery } from "../../core/domain/contracts/repository/iteachers_repository";
import ITeacher from "../../core/domain/model/iteacher";
import { Either, left, right } from "../../core/types/either";
import prisma from "../service/prisma";

class TeachersRepository implements ITeachersRepository{
  async create(props: CreateTeacherProps): Promise<Either<any, ITeacher>> {
    return left(Error("Not Implemented"))
  }
  async update(targetId: number, data: Partial<ITeacher>): Promise<Either<any, Boolean>> {
    return left(Error("Not Implemented"))
  }
  async delete(targetId: number): Promise<Either<any, Boolean>> {
    return left(Error("Not Implemented"))
  }
  async deleteAllFromProject(projectId: number): Promise<Either<any, Boolean>> {
    return left(Error("Not Implemented"))
  }
  async selectFirst(query: SearchTeacherQuery): Promise<Either<any, ITeacher | null>> {
    return left(Error("Not Implemented"))
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
