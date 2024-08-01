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
    return this.#authToken != undefined
  }
  isAuthenticating(){
    return this.#authenticating
  }
}

const auth = new AuthManager()
auth.recoverToken()
