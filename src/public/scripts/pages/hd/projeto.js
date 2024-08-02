class ProjectData{
  #listeners = []
  constructor(project){
    this.id = project.id
    this.name = valueObject(project.name, this.onChange.bind(this))
    this.configuration = {
      id: project.configuration.id,
      preferFirstClasses: valueObject(project.configuration.preferFirstClasses, this.onChange.bind(this)),
      geneticConfiguration: {
        id: project.configuration.geneticConfiguration.id,
        maxOrWithoutBetterGenerations: valueObject(project.configuration.geneticConfiguration.maxOrWithoutBetterGenerations, this.onChange.bind(this)),
        mutationRate: valueObject(project.configuration.geneticConfiguration.mutationRate, this.onChange.bind(this)),
        populationSize: valueObject(project.configuration.geneticConfiguration.populationSize, this.onChange.bind(this)),
        randomIndividualSize: valueObject(project.configuration.geneticConfiguration.randomIndividualSize, this.onChange.bind(this)),
        rankSlice: valueObject(project.configuration.geneticConfiguration.rankSlice, this.onChange.bind(this)),
        roundsOfRoulette: valueObject(project.configuration.geneticConfiguration.roundsOfRoulette, this.onChange.bind(this)),
        selectionMethod: valueObject(project.configuration.geneticConfiguration.selectionMethod, this.onChange.bind(this)),
        stopMethod: valueObject(project.configuration.geneticConfiguration.stopMethod, this.onChange.bind(this)),
      }
    }
  }
  onChange(_){
    for(let l in this.#listeners){
      this.#listeners[l]()
    }
  }
  addListener(listener){
    this.#listeners.push(listener)
  }
  removeListener(listener){
    const i = this.#listeners.find(listener)
    if(i != undefined){
      this.#listeners.splice(i, i)
    }
  }
  toJson(){
    return {
      name: this.name.get(),
      configuration: {
        preferFirstClasses: this.configuration.preferFirstClasses.get(),
        geneticConfiguration: {
          maxOrWithoutBetterGenerations: this.configuration.geneticConfiguration.maxOrWithoutBetterGenerations.get(),
          mutationRate: this.configuration.geneticConfiguration.mutationRate.get(),
          populationSize: this.configuration.geneticConfiguration.populationSize.get(),
          randomIndividualSize: this.configuration.geneticConfiguration.randomIndividualSize.get(),
          rankSlice: this.configuration.geneticConfiguration.rankSlice.get(),
          roundsOfRoulette: this.configuration.geneticConfiguration.roundsOfRoulette.get(),
          selectionMethod: this.configuration.geneticConfiguration.selectionMethod.get(),
          stopMethod: this.configuration.geneticConfiguration.stopMethod.get(),
        }
      }
    }
  }
}

var errorInLoading = false

/**
 * @type ProjectData
 */
var project
var wasProjectModified = valueObject(false)
var wasRankMethodSelected = valueObject(false)
var isSaving = false

const projectSaveIconElement = document.getElementById('project-save-icon-element')
wasProjectModified.addListener((modified) => {
  if(modified){
    projectSaveIconElement.style = ""
  }else{
    projectSaveIconElement.style = "display: none;"
  }
})

const rankSliceElement = document.getElementById('rank-slice-config')
wasRankMethodSelected.addListener((selected) => {
  if(selected){
    rankSliceElement.style = ""
  }else{
    rankSliceElement.style = "display: none;"
  }
})

const projectMessageElement = document.getElementById('project-message')
const projectElement = document.getElementById('project-area')
//// project content ////
const projectNameElement = document.getElementById('project-name')
projectNameElement.onchange = function(event){ project.name.set(event.srcElement.value) }

const projectConfigPrefferFirstClassesElement = document.getElementById('project-config-preffer-first-classes')
projectConfigPrefferFirstClassesElement.onchange = function(event){ project.configuration.preferFirstClasses.set(event.srcElement.checked) }

const projectConfigSelectionMethod = document.getElementById('project-config-selection-method')
projectConfigSelectionMethod.onchange = function(event){
  switch(event.srcElement.value){
    case "0":
      project.configuration.geneticConfiguration.selectionMethod.set("RANK")
      wasRankMethodSelected.set(true)
      return
    case "1":
      project.configuration.geneticConfiguration.selectionMethod.set("COMPETITION")
      wasRankMethodSelected.set(false)
      return
  }
}

const projectConfigRankSlice = document.getElementById('project-config-rank-slice')
const rankSliceValue = document.getElementById('rank-slice-value')
projectConfigRankSlice.onchange = function(event){
  rankSliceValue.innerHTML = event.srcElement.value + "%"
  const percent = event.srcElement.value
  const popSize = project.configuration.geneticConfiguration.populationSize.get()
  project.configuration.geneticConfiguration.rankSlice.set(Math.floor(popSize * (percent / 100)))
}

const projectConfigStopMethod = document.getElementById('project-config-stop-method')
projectConfigStopMethod.onchange = function(event){
  switch(event.srcElement.value){
    case "0":
      project.configuration.geneticConfiguration.stopMethod.set("MAX_GENERATIONS")
      return
    case "1":
      project.configuration.geneticConfiguration.stopMethod.set("GENERATIONS_WITHOUT_BETTER_SCORE")
      return
  }
}

const projectConfigMutationRatio = document.getElementById('project-config-mutation-ratio')
const mutationRatioValue = document.getElementById('mutation-ratio-value')
projectConfigMutationRatio.onchange = function(event){
  mutationRatioValue.innerHTML = event.srcElement.value + "%"
  project.configuration.geneticConfiguration.mutationRate.set(event.srcElement.value / 100)
}

const projectConfigRandomIndividualSize = document.getElementById('project-config-random-individual-size')
const randomIndividualSizeValue = document.getElementById('random-individual-size-value')
projectConfigRandomIndividualSize.onchange = function(event){
  randomIndividualSizeValue.innerHTML = event.srcElement.value + "%"
  const percent = event.srcElement.value
  const popSize = project.configuration.geneticConfiguration.populationSize.get()
  project.configuration.geneticConfiguration.randomIndividualSize.set(Math.floor(popSize * (percent / 100)))
}

const projectConfigPopSize = document.getElementById('project-config-pop-size')
const popSizeValue = document.getElementById('pop-size-value')
projectConfigPopSize.onchange = function(event){
  if(isNaN(Number(event.srcElement.value))){
    event.preventDefault()
    return
  }
  popSizeValue.innerHTML = Number(event.srcElement.value)
  project.configuration.geneticConfiguration.populationSize.set(Number(event.srcElement.value))

  const percentRandom = projectConfigRandomIndividualSize.value
  const popSize = project.configuration.geneticConfiguration.populationSize.get()
  project.configuration.geneticConfiguration.randomIndividualSize.set(Math.floor(popSize * (percentRandom / 100)))

  const percentRank = project.configuration.geneticConfiguration.rankSlice.get()
  project.configuration.geneticConfiguration.rankSlice.set(Math.floor(popSize * (percentRank / 100)))
}

const projectConfigMaxGeneration = document.getElementById('project-max-generation')
projectConfigMaxGeneration.onchange = function(event){
  if(isNaN(Number(event.srcElement.value))){
    event.preventDefault()
    return
  }
  project.configuration.geneticConfiguration.maxOrWithoutBetterGenerations.set(Number(event.srcElement.value))
}
/////////////////////////

function render_project(){
  if(errorInLoading){
    return
  }
  projectMessageElement.style = "display: none;"
  projectElement.style = ""
  // Content
  projectNameElement.value = project.name.get()
  projectConfigPrefferFirstClassesElement.checked = project.configuration.preferFirstClasses.get()

  projectConfigSelectionMethod.value = project.configuration.geneticConfiguration.selectionMethod.get() == "RANK" ? 0 : 1
  wasRankMethodSelected.set(project.configuration.geneticConfiguration.selectionMethod.get() == "RANK")

  projectConfigStopMethod.value = project.configuration.geneticConfiguration.stopMethod.get() == "MAX_GENERATIONS" ? 0 : 1
  projectConfigMaxGeneration.value = project.configuration.geneticConfiguration.maxOrWithoutBetterGenerations.get()
  projectConfigMutationRatio.value = project.configuration.geneticConfiguration.mutationRate.get() * 100
  mutationRatioValue.innerHTML = (project.configuration.geneticConfiguration.mutationRate.get() * 100).toString() + "%"

  const popSize = project.configuration.geneticConfiguration.populationSize.get()
  projectConfigPopSize.value = popSize
  popSizeValue.innerHTML = popSize

  const randomindividuals = project.configuration.geneticConfiguration.randomIndividualSize.get()
  const randomIndividualPercent = Math.floor((randomindividuals / popSize) * 100)
  projectConfigRandomIndividualSize.value = randomIndividualPercent
  randomIndividualSizeValue.innerHTML = randomIndividualPercent.toString() + "%"

  const sliceRank = project.configuration.geneticConfiguration.rankSlice.get()
  const sliceRankPercent = Math.floor((sliceRank / popSize) * 100)
  projectConfigRankSlice.value = sliceRankPercent
  rankSliceValue.innerHTML = sliceRankPercent.toString() + "%"
}

function _on_change_handler(){
  wasProjectModified.set(true)
}

function render_error(e){
  errorInLoading = true
  console.error(e)
  projectMessageElement.style = ""
  projectElement.style = "display: none;"
  projectMessageElement.innerHTML = `<span>${e}</span>`
}

///////// LOAD ///////////
var projectId
async function load_project(){
  const querySearch = window.location.search.replace('?', '')
  const queries = querySearch.split('&')
  for(let q in queries){
    query = queries[q].split('=', 2)
    if(query.length == 2){
      if(query[0] == 'p'){
        projectId = query[1]
        break
      }
    }
  }
  if(projectId > 0){
    try{
      if(project){
        project.removeListener(_on_change_handler)
      }
      const p = await api.loadProject(projectId)
      if(p && p != null){
        project = new ProjectData(p)
        project.addListener(_on_change_handler)
        render_project()
      }else{
        render_error("Projeto não encontrado!")
      }
      await load_teachers()
    }catch(e){
      render_error(e)
    }
  }else{
    render_error("Projeto inválido!")
  }
}

function go_to_projects_page(){
  window.location.href = "http://127.0.0.1:5000/horariodescomplicado/hd"
}

//// SAVE ////
async function save_project(){
  if(isSaving){
    return
  }
  isSaving = true
  try{
    await api.updateProject(project)
    wasProjectModified.set(false)
  }catch(e){
    console.error(e)
    alert("Erro ao salvar!")
  }
  isSaving = false
}

const deleteProjectModel = document.getElementById('delete-project-model')
function delete_project_model(){
  if(deleteProjectModel.style.display == "none"){
    deleteProjectModel.style.display = ""
  }else{
    deleteProjectModel.style.display = "none"
  }
}

var deleting = false
async function delete_project(){
  if(deleting){
    return
  }
  deleting = true
  try{
    await api.deleteProject(project.id)
    delete_project_model()
    go_to_projects_page()
  }catch(e){
    console.error(e)
    alert("Não foi possível deletar o projeto!")
  }
  deleting = false
}

// teachers
var wasTeacherModified = valueObject(false)

const teacherSaveIconElement = document.getElementById('teachers-save-icon-element')
wasTeacherModified.addListener((modified) => {
  if(modified){
    teacherSaveIconElement.style = ""
  }else{
    teacherSaveIconElement.style = "display: none;"
  }
})

function teacher_item_change_handler(index){
  // TODO:
  console.log("Change")
}

function build_teacher_item(index, teacher){
  return `<div>
    <button class="mt-2 bg-red-600 text-white size-6" type="button" onclick="remove_teacher(${index})">-</button>
    <input class="ml-2" type="text" name="teacher" onchange="teacher_item_change_handler(${index})" value="${teacher.name}">
  </div>`
}

function remove_teacher(index){
  // TODO:
  console.log("Remove")
}

var teachers = []
const teachersListElement = document.getElementById('teachers-list')
function render_teachers(){
  if(errorInLoading){
    return
  }
  teachersListElement.innerHTML = ""
  for(let i in teachers){
    teachersListElement.innerHTML += build_teacher_item(i, teachers[i])
  }
}

async function load_teachers(){
  try{
    teachers = await api.loadTeachers(projectId)
  }catch(e){
    console.error(e)
    render_error("Não foi possível carregar os professores!")
  }
}

function add_new_teacher(){
  teachers.push({
    name: "Novo Professor"
  })
  wasTeacherModified.set(true)
  render_teachers()
}

var savingTeachers = false
async function save_teachers(){
  if(savingTeachers){
    return
  }
  savingTeachers = true
  try{
    await api.updateTeachers(projectId, teachers)
    wasTeacherModified.set(false)
    load_teachers()
  }catch(e){
    console.error(e)
    alert("Erro ao salvar professores!")
  }
  savingTeachers = false
}

load_project()
