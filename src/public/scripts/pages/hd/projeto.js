logged_area_handler(true)

//// VIEW ////
const scheduleGenerateButtonEnabled = valueObject(false)
const scheduleGenerateButtonLoading = valueObject(false)

const scheduleViewElement = document.getElementById('schedule-view')
const scheduleViewControllerElement = document.getElementById('schedule-view-controller')
const scheduleGenerateButtonElement = document.getElementById('schedule-generate-button')
const scheduleCancelGenerateButtonElement = document.getElementById('schedule-cancel-generate-button')
scheduleGenerateButtonEnabled.addListener((enabled) => {
  scheduleGenerateButtonElement.disabled = !enabled
})
scheduleGenerateButtonLoading.addListener((loading) => {
  if(loading){
    scheduleGenerateButtonElement.innerHTML = "......."
    scheduleGenerateButtonElement.classList.remove('bg-green-600')
    scheduleGenerateButtonElement.classList.remove('hover:bg-green-800')
    scheduleGenerateButtonElement.classList.add('bg-green-950')
    scheduleCancelGenerateButtonElement.disabled = false
  }else{
    scheduleGenerateButtonElement.innerHTML = "Gerar"
    scheduleGenerateButtonElement.classList.add('bg-green-600')
    scheduleGenerateButtonElement.classList.add('hover:bg-green-800')
    scheduleGenerateButtonElement.classList.remove('bg-green-950')
    scheduleCancelGenerateButtonElement.disabled = true
  }
})
scheduleGenerateButtonElement.onclick = schedule_generate_button_hadler
function schedule_cancel_generate_button_habler(){
  console.log("DISCONNECT")
  apiSocket.disconnect()
}

function schedule_generate_button_hadler(){
  if(errorInLoading || !scheduleGenerateButtonEnabled.get()){
    return
  }
  scheduleGenerateButtonLoading.set(true)
  apiSocket.generate(project.id, function(){
    scheduleGenerateButtonLoading.set(false)
  }, schedule_on_chunk_handler)
}

//// CONFIGURATION ////
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
      this.#listeners.splice(i, 1)
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
  const v = Number(event.srcElement.value)
  if(isNaN(v)){
    event.preventDefault()
    return
  }
  rankSliceValue.innerHTML = `${v}%`
  project.configuration.geneticConfiguration.rankSlice.set(v)
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
  const v = Number(event.srcElement.value)
  if(isNaN(v)){
    event.preventDefault()
    return
  }
  randomIndividualSizeValue.innerHTML = v.toString() + "%"
  project.configuration.geneticConfiguration.randomIndividualSize.set(v)
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

  projectConfigRandomIndividualSize.value = project.configuration.geneticConfiguration.randomIndividualSize.get()
  randomIndividualSizeValue.innerHTML =  project.configuration.geneticConfiguration.randomIndividualSize.get().toString() + "%"

  projectConfigRankSlice.value = project.configuration.geneticConfiguration.rankSlice.get()
  rankSliceValue.innerHTML = project.configuration.geneticConfiguration.rankSlice.get().toString() + "%"
}

function _on_change_handler(){
  wasProjectModified.set(true)
}

function render_error(e){
  scheduleGenerateButtonEnabled.set(false)
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
      await load_subjects()
      await load_classrooms()

      scheduleGenerateButtonEnabled.set(true)
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

//// teachers ////
var wasTeacherModified = valueObject(false)
const teachers = []

const teacherSaveIconElement = document.getElementById('teachers-save-icon-element')
wasTeacherModified.addListener((modified) => {
  if(modified){
    teacherSaveIconElement.style = ""
  }else{
    teacherSaveIconElement.style = "display: none;"
  }
})

function teacher_item_change_handler(index){
  const t = document.getElementById('teacher-list-' + index)
  if(t.value.trim().length > 2){
    teachers[index].name = t.value.trim()
    wasTeacherModified.set(true)
  }
  render_teachers()
}

function build_teacher_item(index, teacher){
  return `<div>
    <button class="mt-2 bg-red-600 text-white size-6" type="button" onclick="remove_teacher(${index})">-</button>
    <input class="ml-2" type="text" onchange="teacher_item_change_handler(${index})" id="teacher-list-${index}" value="${teacher.name}">
  </div>`
}

function remove_teacher(index){
  teachers.splice(index, 1)
  wasTeacherModified.set(true)
  render_teachers()
}

const teachersListElement = document.getElementById('teachers-list')
function render_teachers(){
  if(errorInLoading){
    return
  }
  teachersListElement.innerHTML = ""
  if(teachers.length > 0){
    for(let i in teachers){
      teachersListElement.innerHTML += build_teacher_item(i, teachers[i])
    }
  }else{
    teachersListElement.innerHTML = `<p class="mt-2">Nenhum professor cadastrado!</p>`
  }
}

async function load_teachers(){
  try{
    while(teachers.length > 0){ teachers.pop() }
    const tData = await api.loadTeachers(projectId)
    for(let i in tData){
      teachers.push(tData[i])
    }
    render_teachers()
  }catch(e){
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
    await load_teachers()
    await load_subjects()
    await load_classrooms()
  }catch(e){
    console.error(e)
    alert("Erro ao salvar professores!")
  }
  savingTeachers = false
}

var isTeachersOpen = false
const teachersOpened = document.getElementById('teachers-opened')
const teachersClosed = document.getElementById('teachers-closed')
function _teachers_show_or_hide(){
  if(isTeachersOpen){
    teachersListElement.style = "display: none;"
    teachersOpened.style = "display: none;"
    teachersClosed.style = ""
  }else{
    teachersListElement.style = ""
    teachersOpened.style = ""
    teachersClosed.style = "display: none;"
  }
  isTeachersOpen = !isTeachersOpen
}

load_project()

//// Subjects ////
var wasSubjectModified = valueObject(false)
var subjectsVisible = false
const subjects = []

const subjectListElement = document.getElementById('subjects-list')
const subjectSaveIconElement = document.getElementById('subject-save-icon-element')
const subjectOpenedElement = document.getElementById('subject-opened')
const subjectClosedElement = document.getElementById('subject-closed')

wasTeacherModified.addListener((modified) => {
  if(modified){
    render_subjects()
  }
})

wasSubjectModified.addListener((modified) => {
  if(modified){
    subjectSaveIconElement.style = ""
  }else{
    subjectSaveIconElement.style = "display: none"
  }
  render_subjects()
  render_classrooms()
})

function add_new_subject(){
  subjects.push({
    name: "Nova Matéria"
  })
  wasSubjectModified.set(true)
}

function remove_subject(index){
  subjects.splice(index, 1)
  wasSubjectModified.set(true)
}

function _subjects_show_or_hide(){
  if(subjectsVisible){
    subjectListElement.style = "display: none;"
    subjectOpenedElement.style = "display: none;"
    subjectClosedElement.style = ""
  }else{
    subjectListElement.style = ""
    subjectOpenedElement.style = ""
    subjectClosedElement.style = "display: none;"
  }
  subjectsVisible = !subjectsVisible
}

function subject_name_item_change_handler(index){
  const s = document.getElementById('subject-list-' + index)
  if(s.value.trim().length > 2){
    subjects[index].name = s.value.trim()
    wasSubjectModified.set(true)
  }
  render_subjects()
}

function subject_item_teacher_select_handler(index){
  const selectTeacher = document.getElementById(`subject-list-${index}-teacher`)
  let v = Number(selectTeacher.value)
  if(isNaN(v)){
    return
  }
  if(v == -1){
    v = null
  }
  subjects[index].teacherId = v
  wasSubjectModified.set(true)
}

function build_subject_item(index, subject){
  function build_select(){
    let component = `<select class="ml-2 border-2 text-zinc-950" id="subject-list-${index}-teacher" onchange="subject_item_teacher_select_handler(${index})">`

    const selectedTeacherId = subjects[index].teacherId ? subjects[index].teacherId : -1
    if(selectedTeacherId == -1){
      component += `<option class="text-zinc-950" value="-1" selected>--------</option>`
    }
    for(let t in teachers){
      let isSelected = teachers[t].id == selectedTeacherId
      component += `<option class="text-zinc-950" value="${teachers[t].id}" ${isSelected ? "selected" : ""}>${teachers[t].name}</option>`
    }

    component += `</select>`
    return component
  }
  return `<div>
    <button class="mt-2 bg-red-600 text-white size-6" type="button" onclick="remove_subject(${index})">-</button>
    <input class="ml-2" type="text" onchange="subject_name_item_change_handler(${index})" id="subject-list-${index}" value="${subject.name}">
    ${build_select()}
  </div>`
}

function render_subjects(){
  if(errorInLoading){
    return
  }
  subjectListElement.innerHTML = ""
  if(subjects.length > 0){
    for(let i in subjects){
      subjectListElement.innerHTML += build_subject_item(i, subjects[i])
    }
  }else{
    subjectListElement.innerHTML = `<p class="mt-2">Nenhuma matéria cadastrada!</p>`
  }
}

async function load_subjects(){
  try{
    while(subjects.length > 0){ subjects.pop() }
    const sData = await api.loadSubjects(projectId)
    for(let i in sData){
      subjects.push(sData[i])
    }
    render_subjects()
  }catch(e){
    render_error("Não foi possível carregar as matérias!")
  }
}

var savingSubjects = false
async function save_subject(){
  if(savingSubjects){
    return
  }
  savingSubjects = true
  try{
    await api.updateSubjects(projectId, subjects)
    wasSubjectModified.set(false)
    await load_subjects()
    await load_classrooms()
  }catch(e){
    console.error(e)
    alert("Erro ao salvar materiais!")
  }
  savingSubjects = false
}

//// Classrooms ////
var wasClassroomModified = valueObject(false)
var classroomsVisible = false
const classrooms = []

const classroomsListElement = document.getElementById('classrooms-list')
const classroomSaveIconElement = document.getElementById('classroom-save-icon-element')
const classroomsOpenedElement = document.getElementById('classrooms-opened')
const classroomsClosedElement = document.getElementById('classrooms-closed')

wasClassroomModified.addListener((modified) => {
  if(modified){
    classroomSaveIconElement.style = ""
  }else{
    classroomSaveIconElement.style = "display: none"
  }
  render_classrooms()
})

function add_new_classroom(){
  classrooms.push({
    name: "Nova Sala",
    acceptedSubjects: []
  })
  wasClassroomModified.set(true)
  render_classrooms()
}

function remove_classroom(index){
  classrooms.splice(index, 1)
  wasClassroomModified.set(true)
  render_classrooms()
}

function _classrooms_show_or_hide(){
  if(classroomsVisible){
    classroomsListElement.style = "display: none;"
    classroomsOpenedElement.style = "display: none;"
    classroomsClosedElement.style = ""
  }else{
    classroomsListElement.style = ""
    classroomsOpenedElement.style = ""
    classroomsClosedElement.style = "display: none;"
  }
  classroomsVisible = !classroomsVisible
}

function classroom_name_item_change_handler(index){
  const c = document.getElementById('classroom-list-' + index)
  if(c.value.trim().length > 2){
    classrooms[index].name = c.value.trim()
    wasClassroomModified.set(true)
  }
  render_classrooms()
}

function new_accepted_subject_item_handler(index){
  classrooms[index].acceptedSubjects.push({
    subjectId: -1,
    classes: 1
  })
  wasClassroomModified.set(true)
}

function alreadyIncludesSubject(subjects, targetId){
  for(let s in subjects){
    if(subjects[s].subjectId == targetId){
      return true
    }
  }
  return false
}

function classroom_accepted_subject_item_classes_change_handler(index, indexInAcceptedSubject){
  const classesItem = document.getElementById(`classroom-list-${index}-accepted-subject-${indexInAcceptedSubject}-classes`)
  const classesValue = Number(classesItem.value)
  if(!isNaN(classesValue) && classesValue > 0){
    classrooms[index].acceptedSubjects[indexInAcceptedSubject].classes = classesValue
    wasClassroomModified.set(true)
  }
}

function remove_accepted_subject_item_handler(index, indexInAcceptedSubject){
  classrooms[index].acceptedSubjects.splice(indexInAcceptedSubject, 1)
  wasClassroomModified.set(true)
}

function classroom_accepted_subject_item_change_handler(classroomIndex, indexInAcceptedSubject){
  const item = document.getElementById(`classroom-list-${classroomIndex}-accepted-subject-${indexInAcceptedSubject}`)
  const selectedValue = Number(item.value)
  if(!isNaN(selectedValue)){
    classrooms[classroomIndex].acceptedSubjects[indexInAcceptedSubject].subjectId = selectedValue
  }
  wasClassroomModified.set(true)
}

function build_classroom_item(index, classroom){
  // build list of accepted subjects
  function build_mult_select(){
    // build item of accepted subjects
    function build_item_selected(indexInAcceptedSubject, remainingSubjects){
      const options = [] // opções que aparecem
      options.push({id: -1, name: "-----"})
      const acceptedSubject = classrooms[index].acceptedSubjects[indexInAcceptedSubject]
      const optionSelectedId = acceptedSubject.subjectId
      for(let o in remainingSubjects){
        options.push(remainingSubjects[o])
      }
      if(optionSelectedId > 0){
        for(let i in subjects){
          if(subjects[i].id == optionSelectedId){
            options.push(subjects[i])
            break
          }
        }
      }
      let item_selected = `<div class="mt-2 flex"><select onchange="classroom_accepted_subject_item_change_handler(${index}, ${indexInAcceptedSubject})" id="classroom-list-${index}-accepted-subject-${indexInAcceptedSubject}">`
      for(let i in options){
        item_selected += `<option value="${options[i].id}" ${options[i].id == optionSelectedId ? "selected" : ""}>${options[i].name}</option>`
      }
      item_selected += `</select>
        <input class="ml-2 w-20" type="number" min="1" value="${acceptedSubject.classes}" onchange="classroom_accepted_subject_item_classes_change_handler(${index}, ${indexInAcceptedSubject})" id="classroom-list-${index}-accepted-subject-${indexInAcceptedSubject}-classes">
        <button class="ml-2 mt-2 bg-red-600 text-white size-6" type="button" onclick="remove_accepted_subject_item_handler(${index}, ${indexInAcceptedSubject})">-</button>
        </div>`
      return item_selected
    }

    // subjects that wasn't added
    const remainingSubjects = []
    for(let s in subjects){
      let currentSubjectId = Number(subjects[s].id)
      if(subjects[s].id && !isNaN(currentSubjectId)){
        if(!alreadyIncludesSubject(classrooms[index].acceptedSubjects, currentSubjectId)){
          remainingSubjects.push({
            id: currentSubjectId,
            name: subjects[s].name
          })
        }
      }
    }
    remainingSubjects.sort((a, b) => a.name.localeCompare(b.name))

    let multiselect = `<button class="mt-2 bg-green-600 text-white size-6" type="button" onclick="new_accepted_subject_item_handler(${index})">+</button>
      <div class="ml-8" id="classroom-list-${index}-subjects">`
    if(classrooms[index].acceptedSubjects.length <= 0){
      multiselect += `<p class="mt-2">Nenhuma matéria vinculada a esta sala!</p></div>`
      return multiselect
    }

    for(let askey in classrooms[index].acceptedSubjects){
      let asId = classrooms[index].acceptedSubjects[askey].subjectId
      if(asId == -1){
        multiselect += `<div class="mt-2">${build_item_selected(askey, remainingSubjects)}</div>`
      }else{
        for(let s in subjects){
          let currentSubjectId = Number(subjects[s].id)
          if(!isNaN(currentSubjectId) && currentSubjectId == asId){
            multiselect += build_item_selected(askey, remainingSubjects)
            break
          }
        }
      }
    }

    multiselect += `</div>`
    return multiselect
  }
  return `<div>
    <button class="mt-2 bg-red-600 text-white size-6" type="button" onclick="remove_classroom(${index})">-</button>
    <input class="ml-2" type="text" onchange="classroom_name_item_change_handler(${index})" id="classroom-list-${index}" value="${classroom.name}">
    ${build_mult_select()}
  </div>`
}

function render_classrooms(){
  if(errorInLoading){
    return
  }
  classroomsListElement.innerHTML = ""
  if(classrooms.length > 0){
    for(let i in classrooms){
      classroomsListElement.innerHTML += build_classroom_item(i, classrooms[i])
    }
  }else{
    classroomsListElement.innerHTML = `<p class="mt-2">Nenhuma sala cadastrada!</p>`
  }
}

async function load_classrooms(){
  try{
    while(classrooms.length > 0){ classrooms.pop() }
    const cData = await api.loadClassrooms(projectId)
    for(let i in cData){
      classrooms.push(cData[i])
    }
    render_classrooms()
  }catch(e){
    render_error("Não foi possível carregar as salas!")
  }
}

var savingClassrooms = false
async function save_classrooms(){
  if(savingClassrooms){
    return
  }
  savingClassrooms = true
  try{
    await api.updateClassrooms(projectId, classrooms)
    wasClassroomModified.set(false)
    await load_classrooms()
  }catch(e){
    console.error(e)
    alert("Erro ao salvar Salas!")
  }
  savingClassrooms = false
}

//// Avaliable Hours ////
// ! TODO

//// SCHEDULE ////
const schedule_table_data = valueObject({})
function schedule_on_chunk_handler(chunk){
  console.log("Receiving chunk...")
  schedule_table_data.set(chunk)
}

schedule_table_data.addListener((data) => {
  scheduleViewElement.innerHTML = ""
  // Update table
  buildScheduleViewTable(data)
})

function buildScheduleViewTable(data){
  function buildLine(classroom){
    console.log(classroom)
    // ! TODO
    return ""
  }
  if(data.classrooms && data.classrooms.length > 0){
    scheduleViewElement.innerHTML += "<table>"
    for(let c in data.classrooms){
      scheduleViewElement.innerHTML += buildLine(data.classrooms[c])
    }
    scheduleViewElement.innerHTML += "</table>"
  }
}
