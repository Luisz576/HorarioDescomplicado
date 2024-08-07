import IProject from "../../core/domain/model/iproject";
import IProjectRepository, { CreateProjectProps, SearchProjectQuery } from "../../core/domain/contracts/repository/iproject_repository"
import prisma from "../service/prisma";
import { Either, left, right } from "../../core/types/either"
import ProjectMapper from "../mapper/project_mapper";

class ProjectRepository implements IProjectRepository{
  constructor(){}
  async create(props: CreateProjectProps): Promise<Either<any, IProject>> {
    try{
      return right(
        await prisma.project.create({
          data: ProjectMapper.toPrisma(props)
        })
      )
    }catch(e){
      return left("couldn't create project: " + e)
    }
  }
  async update(targetId: number, data: Partial<IProject>): Promise<Either<any, Boolean>> {
    try{
      await prisma.project.update({
        data: ProjectMapper.toPrismaPartial(data),
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
      return left("couldn't delete project: " + e)
    }
  }
  async selectFirst(query: SearchProjectQuery): Promise<Either<any, IProject | null>> {
    try{
      return right(
        await prisma.project.findFirst({
          where: query
        })
      )
    }catch(e){
      return left(e)
    }
  }
  async selectAll(query: SearchProjectQuery): Promise<Either<any, IProject[]>> {
    try{
      return right(
        await prisma.project.findMany({
          where: query
        })
      )
    }catch(e){
      return left(e)
    }
  }
}

const projectRepository = new ProjectRepository()
export default projectRepository
