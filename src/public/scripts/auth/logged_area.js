async function _logout_auth(){
  auth.logout()
  window.location.href = "http://127.0.0.1:5000/horariodescomplicado"
}

async function logged_area_handler(need_to_be_logged, on_logged = () => {}, on_unlogged = () => {}){
  auth.ensureIsAuthenticated({
    throws: false,
    callback: (authenticated) => {
      if(authenticated){
        on_logged()
      }else{
        if(need_to_be_logged){
          _logout_auth()
        }
        on_unlogged()
      }
    }
  })
}
