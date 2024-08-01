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

load_projects()
