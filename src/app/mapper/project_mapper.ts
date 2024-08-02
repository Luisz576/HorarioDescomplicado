import IProject from "../../core/domain/model/iproject";

export default class ProjectMapper{
  static toPrisma(project: Omit<IProject, 'id'>){
    return {
      name: project.name,
      ownerId: project.ownerId,
      configurationId: project.configurationId
    }
  }
  static toPrismaPartial(project: Partial<Omit<IProject, 'id'>>){
    return {
      name: project.name,
      ownerId: project.ownerId,
      configurationId: project.configurationId
    }
  }
}
