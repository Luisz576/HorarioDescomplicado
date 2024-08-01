class AuthManager{
  #cookieManager = new CookieManager()
  #authApiUrl = "http://127.0.0.1:5000/api/auth"
  #authTokenKey = 'auth_token'
  #authToken = undefined
  #authenticating = false
  async recoverToken(){
    this.#authenticating = true
    const recoveredAuthToken = this.#cookieManager.get(this.#authTokenKey)
    if(recoveredAuthToken){
      const response = await http.post(this.#authApiUrl + "/login/token", {}, {
        "auth_token": recoveredAuthToken
      })
      if(response.status == 200){
        const newAuthToken = (await response.json()).token
        if(newAuthToken){
          this.#cookieManager.set(this.#authTokenKey, newAuthToken)
          this.#authToken = newAuthToken
        }else{
          this.#authToken = recoveredAuthToken
        }
      }else{
        this.#authToken = undefined
      }
    }
    this.#authenticating = false
  }
  authToken(){
    return this.#authToken
  }
  isAuthenticated(){
    return this.#authToken !== undefined
  }
  isAuthenticating(){
    return this.#authenticating
  }
  async ensureIsAuthenticated(p = {ms: 2000, c: 5, callback: (_authenticated) => {}, throws: true}){
    if(!p.ms || p.ms < 0){
      p.ms = 2000
    }
    if(!p.c || p.c < 0){
      p.c = 5
    }

    let count = 0
    while(count < p.c && this.isAuthenticating()){
      count++
      await sleep(p.ms/p.c)
    }
    if(this.isAuthenticated()){
      if(p.callback){
        p.callback(true)
      }
      return
    }
    if(p.callback){
      p.callback(false)
    }
    if(p.throws){
      throw Error("Not Authenticated")
    }
  }
  async logout(){
    this.#authToken = undefined
    this.#cookieManager.remove(this.#authTokenKey)
  }
  async loginWithUsernameAndPassword(username, password){
    const response = await http.post(this.#authApiUrl + "/login", {
      username: username,
      password: password
    })
    if(response.status == 200){
      const authToken = (await response.json()).token
      if(authToken){
        this.#cookieManager.set(this.#authTokenKey, authToken)
        this.#authToken = authToken
      }
    }
  }
}

const auth = new AuthManager()
auth.recoverToken()
