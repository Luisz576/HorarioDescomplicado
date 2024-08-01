import IHttpContext from "../../core/domain/contracts/http/ihttp_context";
import GetClientName from "../usecase/auth/get_client_name";
import createProject from "../usecase/project/create_project";
import deleteProject from "../usecase/project/delete_project";
import getAllProjects from "../usecase/project/get_all_projects";
import getProject from "../usecase/project/get_project";
import updateProject from "../usecase/project/update_project";

export default class ProjectController{
  constructor(
    private getClientName: GetClientName
  ){}
  async create(context: IHttpContext){
    const { name } = context.getRequest().body
    const { auth_token } = context.getRequest().headers
    const res = await createProject.exec({
      name: name,
      ownerId: this.getClientName.execute(auth_token),
    })
    if(res.isRight()){
      return context.getResponse().json({
        status: 201,
        data: res.value
      })
    }
    console.error(res.value)
    return context.getResponse().sendStatus(500)
  }
  async get(context: IHttpContext){
    const targetId = context.getRequest().params.pid
    const { auth_token } = context.getRequest().headers
    if(!targetId || isNaN(Number(targetId))){
      return context.getResponse().sendStatus(400)
    }
    const res = await getProject.exec(Number(targetId), this.getClientName.execute(auth_token))
    if(res.isRight()){
      return context.getResponse().json({
        status: 200,
        project: res.value
      })
    }
    if(res.value == 401){ // trying to access a project that isn't yours
      return context.getResponse().sendStatus(401)
    }
    console.error(res.value)
    return context.getResponse().sendStatus(500)
  }
  async show(context: IHttpContext){
    const { auth_token } = context.getRequest().headers
    const ownerId = this.getClientName.execute(auth_token)
    if(!ownerId){
      return context.getResponse().sendStatus(500)
    }
    const res = await getAllProjects.exec({
      ownerId: ownerId
    })
    if(res.isRight()){
      return context.getResponse().json({
        status: 200,
        projects: res.value.map((v) => {
          return {
            id: v.id,
            name: v.name
          }
        })
      })
    }
    console.error(res.value)
    return context.getResponse().sendStatus(500)
  }
  async delete(context: IHttpContext){
    const targetId = context.getRequest().params.pid
    const { auth_token } = context.getRequest().headers
    if(!targetId || isNaN(Number(targetId))){
      return context.getResponse().sendStatus(400)
    }
    const res = await deleteProject.exec(
      Number(targetId),
      this.getClientName.execute(auth_token)
    )
    if(res.isRight()){
      if(res.value){
        return context.getResponse().json({
          status: 200
        })
      }
      return context.getResponse().sendStatus(403)
    }
    return context.getResponse().sendStatus(500)
  }
  async update(context: IHttpContext){
    const targetId = context.getRequest().params.pid
    if(!targetId || isNaN(Number(targetId))){
      return context.getResponse().sendStatus(400)
    }
    const { auth_token } = context.getRequest().headers
    const client = this.getClientName.execute(auth_token)
    if(!client){
      return context.getResponse().sendStatus(400)
    }

    const projectUpdate = context.getRequest().body
    if(auth_token && projectUpdate){
      const res = await updateProject.exec(Number(targetId), client, projectUpdate)
      if(res.isRight()){
        if(res.value){
          return context.getResponse().json({
            status: 200
          })
        }
        return context.getResponse().sendStatus(401)
      }
      return context.getResponse().sendStatus(500)
    }
    return context.getResponse().sendStatus(400)
  }
}
