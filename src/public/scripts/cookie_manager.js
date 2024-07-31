class CookieManager{
  set(key, value, time = 0){
    if(time <= 0){
      time = (7 * 24 * 60 * 60 * 1000)
    }
    const date = new Date();
    date.setTime(date.getTime() + time);
    document.cookie = encodeURIComponent(key)+"="+encodeURIComponent(value)+"; expires="+date.toUTCString()+"; path=/";
  }
  get(key){
    const encodedKey = encodeURIComponent(key)
    const cookies = document.cookie.split(';')
    for(let i in cookies){
      let cookieParts = cookies[i].split('=')
      if(cookieParts[0] == encodedKey){
        return decodeURIComponent(cookieParts[1])
      }
    }
  }
  remove(key){
    const date = new Date();
    date.setTime(date.getTime() + (-1 * 24 * 60 * 60 * 1000));
    document.cookie = encodeURIComponent(key)+"=; expires="+date.toUTCString()+"; path=/";
  }
}
