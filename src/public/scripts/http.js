class Http{
  STATUS_OK = 200
  STATUS_CREATED = 201

  async get(url, parameters={}, headers={}){
    let v = false
    url += "?"
    for(p in parameters){
      if(v){
        url += "&"
      }
      url +=p + "=" + parameters[p]
      v = true
    }
    headers["Content-Type"] = "application/json"
    return fetch(encodeURIComponent(url), {
      method: "GET",
      headers: headers
    })
  }
  async post(url, body={}, headers={}){
    headers["Content-Type"] = "application/json"
    return fetch(encodeURIComponent(url), {
      method: "POST",
      body: JSON.stringify(body)
    })
  }
  // delete()
}

const http = new Http()
