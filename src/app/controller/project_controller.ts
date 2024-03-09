import IHttpContext from "../../core/domain/http/ihttp_context";
import GetClientName from "../usecase/auth/get_client_name";
import createProject from "../usecase/project/create_project";
import deleteProject from "../usecase/project/delete_project";

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
    return context.getResponse().sendStatus(400)
  }
  async delete(context: IHttpContext){
    const { targetId } = context.getRequest().body
    const { auth_token } = context.getRequest().headers
    const res = await deleteProject.exec(
      targetId,
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
    return context.getResponse().sendStatus(400)
  }
}
