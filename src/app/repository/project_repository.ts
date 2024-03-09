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
  delete(): Promise<Either<any, Boolean>> {
    throw new Error("Method not implemented.");
  }
}

const projectRepository = new ProjectRepository()
export default projectRepository
