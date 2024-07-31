class AuthManager{
  #cookieManager = new CookieManager()
  #authTokenKey = 'auth_token'
  #authToken = undefined
  #authenticating = false
  async recoverToken(){
    this.#authenticating = true
    const recoveredAuthToken = this.#cookieManager.get(this.#authTokenKey)
    if(recoveredAuthToken){
      // TODO: validar token
      // await ...
      if(true){
        // logado
        this.#authToken = recoveredAuthToken
      }else{
        this.#cookieManager.remove(this.#authTokenKey)
        this.#authToken = undefined
      }
    }
    this.#authenticating = false
  }
  authToken(){
    return this.#authToken
  }
  isAuthenticated(){
    return this.#authToken != undefined
  }
  isAuthenticating(){
    return this.#authenticating
  }
}

const auth = new AuthManager()
auth.recoverToken()
