import IHttpContext from "../../core/domain/contracts/http/ihttp_context"
import GetClientName from "../usecase/auth/get_client_name"
import CreateAndUpdateClassrooms from "../usecase/project/classrooms/create_and_update_classrooms"
import GetClassrooms from "../usecase/project/classrooms/get_classrooms"

export default class ClassroomsController{
  constructor(
    private getClientName: GetClientName,
    private getClassrooms: GetClassrooms,
    private createAndUpdateClassrooms: CreateAndUpdateClassrooms
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
      const classrooms = await this.getClassrooms.exec(Number(pid), client_id)
      if(classrooms.isRight()){
        return context.getResponse().json({
          classrooms: classrooms.value
        })
      }
      console.error(classrooms.value)
      return context.getResponse().sendStatus(500)
    }
    return context.getResponse().sendStatus(401)
  }
  async storeAndUpdate(context: IHttpContext){
    const { pid } = context.getRequest().params
    const { classrooms } = context.getRequest().body
    const { auth_token } = context.getRequest().headers
    if(auth_token){
      const client_id = this.getClientName.execute(auth_token)
      if(!client_id){
        return context.getResponse().sendStatus(401)
      }
      if(isNaN(Number(pid)) || classrooms == undefined || !Array.isArray(classrooms)){
        return context.getResponse().sendStatus(400)
      }
      if(classrooms.length == 0 || classrooms[0].name){
        const res = await this.createAndUpdateClassrooms.exec(Number(pid), client_id, classrooms)
        if(res.isRight()){
          if(res.value){
            return context.getResponse().sendStatus(200)
          }
          return context.getResponse().sendStatus(400)
        }
        console.error(res.value)
        return context.getResponse().sendStatus(500)
      }
      return context.getResponse().sendStatus(400)
    }
    return context.getResponse().sendStatus(401)
  }
}
