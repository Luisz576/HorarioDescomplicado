import ScheduleOrganizerGenetic from "../../core/schedule_organizer/schedule_organizer_genetic"
import { Either, left, right } from "../../core/types/either"
import GetScheduleOrganizerData from "../usecase/schedule_organizer/get_schedule_organizer_data"

export default class ScheduleOrganizerState{
  constructor(
    private getScheduleOrganizerData: GetScheduleOrganizerData
  ){}

  authenticated = false
  clientId: string | undefined
  projectId: number = -1
  running = true
  #genetic: ScheduleOrganizerGenetic | undefined

  _generate(emiter: (data: any) => void, onDone: () => void, onError: (error: any) => void){
    if(!this.#genetic) return
    this.#genetic.evolve(
      this.#generationCallback.bind(this, emiter)
    ) // ! ESTÁ TRAVANDO A THREAD PRINCIPAL
    .then(onDone)
    .catch(onError)
  }
  generate(emiter: (data: any) => void, onDone: () => void, onError: (error: any) => void, projectId: number){
    this.projectId = projectId

    this.#createGenetic()
    .then((wasCreatedRes) => {
      if(wasCreatedRes.isLeft()){
        return onError("Couln't start generating")
      }
      if(this.#genetic){
        process.nextTick(this._generate.bind(this, emiter, onDone, onError))
      }else{
        onError("Couln't start generating")
      }
    })
    .catch(onError)
  }

  #generationCallback(emiter: (data: any) => void, generation: number): boolean{
    if(generation % 10 == 0){
      if(this.#genetic){
        const bestPhenotype = this.#genetic.bestPhenotype()
        emiter({
          generation: generation,
          classrooms: bestPhenotype
        })
      }
    }
    return this.running
  }

  async #createGenetic(): Promise<Either<any, boolean>>{
    if(!this.clientId){
      return left("Invalid Client")
    }
    // load data
    const res = await this.getScheduleOrganizerData.exec(this.projectId, this.clientId)

    if(res.isRight()){
      const so = res.value
      this.#genetic = new ScheduleOrganizerGenetic(so.props, so.configuration)
      return right(true)
    }

    return left(res.value)
  }
}
