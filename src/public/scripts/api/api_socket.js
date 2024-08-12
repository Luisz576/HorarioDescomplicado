class ApiSocket{
  #api_url = "http://127.0.0.1:5000/api/v1/socket"
  #conn

  hasConn(){
    return this.#conn != undefined
  }

  async generate(){
    if(this.#conn){
      return
    }
    this.#conn = io();
    // TODO: create connection
  }

  disconnect(){
    // TODO: break connection
    this.#conn = undefined
  }
}

const apiSocket = new ApiSocket()
