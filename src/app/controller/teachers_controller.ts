import IHttpContext from "../../core/domain/contracts/http/ihttp_context";
import GetClientName from "../usecase/auth/get_client_name";
import CreateAndUpdateTeachers from "../usecase/project/teacher/create_and_update_teachers";
import GetTeachers from "../usecase/project/teacher/get_teachers";

export default class TeachersController{
  constructor(
    private getClientName: GetClientName,
    private getTeachers: GetTeachers,
    private createAndUpdateTeachers: CreateAndUpdateTeachers
  ){}
  async show(context: IHttpContext){
    const { pid } = context.getRequest().params
    const { auth_token } = context.getRequest().headers
    if(auth_token){
      const client_id = this.getClientName.execute(auth_token)
      if(!client_id){
        return context.getResponse().sendStatus(401)
      }
      if(isNaN(Number(pid))){
        return context.getResponse().sendStatus(400)
      }
      const teachers = await this.getTeachers.exec(Number(pid), client_id)
      if(teachers.isRight()){
        return context.getResponse().json({
          teachers: teachers.value
        })
      }
      console.error(teachers.value)
      return context.getResponse().sendStatus(500)
    }
    return context.getResponse().sendStatus(401)
  }
  async storeAndUpdate(context: IHttpContext){
    const { pid } = context.getRequest().params
    const { teachers } = context.getRequest().body
    const { auth_token } = context.getRequest().headers
    if(auth_token){
      const client_id = this.getClientName.execute(auth_token)
      if(!client_id){
        return context.getResponse().sendStatus(401)
      }
      if(isNaN(Number(pid)) || teachers == undefined || !Array.isArray(teachers)){
        return context.getResponse().sendStatus(400)
      }
      if(teachers.length == 0 || teachers[0].name){
        const res = await this.createAndUpdateTeachers.exec(Number(pid), client_id, teachers)
        if(res.isRight()){
          if(res.value){
            return context.getResponse().sendStatus(200)
          }
          return context.getResponse().sendStatus(400)
        }
        return context.getResponse().sendStatus(500)
      }
      return context.getResponse().sendStatus(400)
    }
    return context.getResponse().sendStatus(401)
  }
}
