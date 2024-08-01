async function exec() {
  try{
    console.log(
      await api.loadProject(1)
    )
  }catch(e){
    console.error(e)
  }
}

exec()
