const loginFormArea = document.getElementById('login-form-area')

function _go_to_index_logged_page(){
  window.location.href = 'http://127.0.0.1:5000/horariodescomplicado/hd'
}

function _on_logged(){
  _go_to_index_logged_page()
}

function _on_unlogged(){
  loginFormArea.style = "visibility: visible;"
}

function index_initialize(){
  loginFormArea.style = "visibility: hidden;"
  logged_area_handler(false, _on_logged, _on_unlogged)
}

function _index_login_button_handler(){
  const username = document.getElementById('username').value
  const password = document.getElementById('password').value

  auth.loginWithUsernameAndPassword(username, password).then(() => {
    if(auth.isAuthenticated()){
      _go_to_index_logged_page()
    }else{
      alert("Usuário ou senha incorreto(s)!")
    }
  })
}

index_initialize()
