logged_area_handler(true)

const projects_element = document.getElementById('projects-list')

function _project_item_handler(project_id){
  window.location.href = "http://127.0.0.1:5000/horariodescomplicado/hd/projeto.html?p=" + project_id
}

function build_project_item(project_name, project_id){
  return `<div class="border-2 ml-2 mb-2 min-w-max border-zinc-800">
            <div class="my-1 mx-2">
              <h3 class="font-bold text-sm text-green-600 hover:text-green-800 hover:cursor-pointer" onclick="_project_item_handler(${project_id})">${project_name}</h3>
            </div>
          </div>`
}

async function load_projects() {
  projects_element.innerHTML = ""
  try{
    const projects = await api.loadProjects()
    projects.sort((a, b) => {
      return a.name.localeCompare(b.name)
    })
    for(let p in projects){
      projects_element.innerHTML += build_project_item(projects[p].name, projects[p].id)
    }
  }catch(e){
    projects_element.innerHTML += `
      <div>
        <span class="text-lg font-bold">Erro ao carregar os projetos!</span>
        <p class="text-sm">${e}</p>
      </div>
    `
  }
}

const newProjectName = document.getElementById('new-project-name')
var creating = false
async function create_new_project(){
  if(creating){
    return
  }
  creating = true
  if(newProjectName.value.trim().length > 3){
    try{
      await api.createProject(newProjectName.value.trim())
      newProjectName.value = ""
      new_project_modal()
      load_projects()
    }catch(e){
      console.error(e)
      alert("Erro ao criar")
    }
    creating = false
    return
  }
  creating = false
  alert("Nome inválido")
}

const newProjectModal = document.getElementById('new-project-modal')
function new_project_modal(){
  if(newProjectModal.style.display == "none"){
    newProjectModal.style.display = ""
  }else{
    newProjectModal.style.display = "none"
  }
}

load_projects()
