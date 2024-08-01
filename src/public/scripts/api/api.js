class Api{
  #api_url = "http://127.0.0.1:5000/api/v1"
  #auth
  constructor(auth){
    this.#auth = auth
  }

  async ensureIsAuthenticated(ms = 2000, c=5){
    let count = 0
    while(count < c && this.#auth.isAuthenticating()){
      count++
      await sleep(ms/c)
    }
    if(!this.#auth.isAuthenticated()){
      throw Error("Not Authenticated")
    }
  }

  async createProject(projectName){
    await this.ensureIsAuthenticated()

    const res = await http.post(this.#api_url + "/project", {
      "name": projectName
    }, this.#authenticatedHeader())

    if(res.status == 200){
      return true
    }
    return false
  }

  async loadProject(id){
    await this.ensureIsAuthenticated()

    const res = await http.get(this.#api_url + "/project/" + id, {}, this.#authenticatedHeader())

    if(res.status == 200){
      const project = (await res.json()).project
      return project
    }
    throw Error("Error to load project")
  }

  async loadProjects(){
    await this.ensureIsAuthenticated()

    const res = await http.get(this.#api_url + "/projects", {}, this.#authenticatedHeader())

    if(res.status == 200){
      const projects = (await res.json()).projects
      return projects
    }
    throw Error("Error to load projects")
  }

  #authenticatedHeader(){
    return {
      "auth_token": this.#auth.authToken()
    }
  }
}

const api = new Api(auth)
