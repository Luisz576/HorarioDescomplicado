class Api{
  #api_url = "127.0.0.1:5000/api/v1"
  #auth
  constructor(auth){
    this.#auth = auth
  }

  async createProject(projectName){
    if(!this.#auth.isAuthenticated()){
      throw Error("Not Authenticated")
    }
    const res = await http.post(this.#api_url, {
      "name": projectName
    }, this.#authenticatedHeader())
    if(res.status == http.STATUS_CREATED){
      console.log(res.json)
      return true
    }
    return false
  }

  async loadProjects(){

  }

  #authenticatedHeader(){
    return {
      "auth_token": this.#auth.authToken()
    }
  }
}

const api = new Api(auth)
