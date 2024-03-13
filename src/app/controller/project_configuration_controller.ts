import IHttpContext from "../../core/domain/http/ihttp_context";

export default class ProjectConfigurationController{
    async update(context: IHttpContext){
        const {
            projectId,
            // TODO: configs
         } = context.getRequest().body
    }
}
