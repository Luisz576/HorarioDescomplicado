import IHttpContext from "../../core/domain/contracts/http/ihttp_context";
import GetClientName from "../usecase/auth/get_client_name";
import CreateAndUpdateSubjects from "../usecase/project/subject/create_and_update_subjects";
import GetSubjects from "../usecase/project/subject/get_subjects";

export default class TeacherController{
  constructor(
    private getClientName: GetClientName,
    private getSubjects: GetSubjects,
    private createAndUpdateSubjects: CreateAndUpdateSubjects,
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
      const subjects = await this.getSubjects.exec(Number(pid), client_id)
      if(subjects.isRight()){
        return context.getResponse().json({
          subjects: subjects.value
        })
      }
      console.error(subjects.value)
      return context.getResponse().sendStatus(500)
    }
    return context.getResponse().sendStatus(401)
  }
  async storeAndUpdate(context: IHttpContext){
    const { pid } = context.getRequest().params
    const { subjects } = context.getRequest().body
    const { auth_token } = context.getRequest().headers
    if(auth_token){
      const client_id = this.getClientName.execute(auth_token)
      if(!client_id){
        return context.getResponse().sendStatus(401)
      }
      if(isNaN(Number(pid)) || subjects == undefined || !Array.isArray(subjects)){
        return context.getResponse().sendStatus(400)
      }
      if(subjects.length == 0 || subjects[0].name){
        const res = await this.createAndUpdateSubjects.exec(Number(pid), client_id, subjects)
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
