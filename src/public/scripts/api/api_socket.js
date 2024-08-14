const EVENTS_C2S = {
  GENERATE: "generate"
}

const EVENTS_S2C = {
  GENERATING_STATUS: "generating_status",
  DISCONNECT: "disconnect"
}

class ApiSocket{
  #conn

  hasConn(){
    return this.#conn != undefined
  }

  #emit(event, msg){
    this.#conn.emit(event, msg)
  }

  #listen(event, listener){
    this.#conn.on(event, listener)
  }

  async generate(projectId, onDisconnect, onChunk){
    if(this.#conn){
      return
    }
    this.#conn = io();
    // generating status
    this.#listen(EVENTS_S2C.GENERATING_STATUS, onChunk)
    this.#listen(EVENTS_S2C.DISCONNECT, onDisconnect)

    // authenticate
    const authMessage = {
      projectId: projectId,
      authToken: auth.authToken()
    }
    this.#emit(EVENTS_C2S.GENERATE, authMessage)
  }

  disconnect(){
    this.#conn.disconnect()
    this.#conn = undefined
  }
}

const apiSocket = new ApiSocket()
