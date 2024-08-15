import { Either, left, right } from "../../core/types/either"
import GetScheduleOrganizerData, { ScheduleOrganizerRunnerProps } from "../usecase/schedule_organizer/get_schedule_organizer_data"
import scheduleOrganizerWorker from './schedule_organizer_worker'

export default class ScheduleOrganizerState{
  constructor(
    private getScheduleOrganizerData: GetScheduleOrganizerData
  ){}

  authenticated = false
  clientId: string | undefined
  projectId: number = -1
  worker: Worker | undefined

  #getWorker(worker: Worker){
    this.worker = worker
  }

  async #executer(emiter: (data: any) => void, onDone: () => void, onError: (error: any) => void){
    const resGeneticData = await this.createGeneticData()
    if(resGeneticData.isRight()){
      const so = resGeneticData.value
      scheduleOrganizerWorker(so,
        (msg: any) => {
          if(msg == 200){
            return onDone()
          }else if(msg == 100){
            return onError(100)
          }
          return emiter(msg)
        },
        onError,
        onDone,
        this.#getWorker.bind(this)
      )
    }else{
      onError(resGeneticData.value)
    }
  }

  async createGeneticData(): Promise<Either<any, ScheduleOrganizerRunnerProps>>{
    if(!this.clientId){
      return left("Invalid Client")
    }
    // load data
    const res = await this.getScheduleOrganizerData.exec(this.projectId, this.clientId)

    if(res.isRight()){
      return right(res.value)
    }

    return left(res.value)
  }

  cancel() {
    if(this.worker){
      console.log("Terminate Worker")
      this.worker.terminate()
    }
  }

  generate(emiter: (data: any) => void, onDone: () => void, onError: (error: any) => void, projectId: number){
    this.projectId = projectId
    this.#executer(emiter, onDone, onError)
  }
}
