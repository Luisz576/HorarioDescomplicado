import IHttpContext from "../../domain/http/ihttp_context";
import createProject from "../usecase/project/create_project";

export default class ProjectController{
  async create(context: IHttpContext){
    const { name } = context.getRequest().body
    const res = await createProject.exec({
      name: name
    })
    if(res.isRight()){
      return context.getResponse().json({
        status: 200,
        data: res.value
      })
    }
    console.log(res)
    return context.getResponse().sendStatus(400)
  }
}
