import IProject from "../../core/domain/model/iproject";
import IProjectRepository, { CreateProjectProps } from "../../core/domain/repository/iproject_repository"
import prisma from "../service/prisma";
import { Either, left, right } from "../../core/utils/either"

class ProjectRepository implements IProjectRepository{
  constructor(){}
  async create(props: CreateProjectProps): Promise<Either<any, IProject>> {
    try{
      const res = await prisma.project.create({
        data: {
          name: props.name,
          configurationId: props.configurationId
        }
      })
      return right(res)
    }catch(e){
      return left("couldn't create project: " + e)
    }
  }
  async update(targetId: number, data: Partial<IProject>): Promise<Either<any, Boolean>> {
    try{
      await prisma.project.update({
        data: data,
        where: {
          id: targetId
        }
      })
      return right(true)
    }catch(e){
      return left("couldn't update project: " + e)
    }
  }
  async delete(targetId: number): Promise<Either<any, Boolean>>{
    try{
      await prisma.project.delete({
        where: {
          id: targetId
        }
      })
      return right(true)
    }catch(e){
      return left("couldn't update project: " + e)
    }
  }
}

const projectRepository = new ProjectRepository()
export default projectRepository
