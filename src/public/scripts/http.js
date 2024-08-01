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
    return fetch(encodeURI(url), {
      method: "GET",
      headers: headers
    })
  }
  async post(url, body={}, headers={}){
    headers["Content-Type"] = "application/json"
    return fetch(encodeURI(url), {
      method: "POST",
      body: JSON.stringify(body),
      headers: headers
    })
  }
  // delete()
}

const http = new Http()
