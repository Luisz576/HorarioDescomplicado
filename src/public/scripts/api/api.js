class Api{
  #api_url = "http://127.0.0.1:5000/api/v1"
  #auth
  constructor(auth){
    this.#auth = auth
  }

  async createProject(projectName){
    await this.#auth.ensureIsAuthenticated()

    const res = await http.post(this.#api_url + "/project", {
      "name": projectName
    }, this.#authenticatedHeader())

    if(res.status == 200){
      return true
    }
    return false
  }

  async loadProject(id){
    await this.#auth.ensureIsAuthenticated()

    const res = await http.get(this.#api_url + "/project/" + id, {}, this.#authenticatedHeader())

    if(res.status == 200){
      const project = (await res.json()).project
      return project
    }
    throw Error("Error to load project")
  }

  async loadProjects(){
    await this.#auth.ensureIsAuthenticated()

    const res = await http.get(this.#api_url + "/projects", {}, this.#authenticatedHeader())

    if(res.status == 200){
      const projects = (await res.json()).projects
      return projects
    }
    throw Error("Error to load projects")
  }

  async updateProject(projectData){
    const pjson = projectData.toJson()
    const res = await http.patch(this.#api_url + "/project/" + projectData.id, pjson, this.#authenticatedHeader())
    if(res.status == 200){
      return
    }
    throw Error("Error to save project")
  }

  #authenticatedHeader(){
    return {
      "auth_token": this.#auth.authToken()
    }
  }
}

const api = new Api(auth)
