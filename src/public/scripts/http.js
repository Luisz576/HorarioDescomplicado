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
  async patch(url, body={}, headers={}){
    headers["Content-Type"] = "application/json"
    return fetch(encodeURI(url), {
      method: "PATCH",
      body: JSON.stringify(body),
      headers: headers
    })
  }
  async delete(url, body={}, headers={}){
    headers["Content-Type"] = "application/json"
    return fetch(encodeURI(url), {
      method: "DELETE",
      body: JSON.stringify(body),
      headers: headers
    })
  }
  async head(url, headers={}){
    headers["Content-Type"] = "application/json"
    return fetch(encodeURI(url), {
      method: "HEAD",
      headers: headers
    })
  }
}

const http = new Http()
