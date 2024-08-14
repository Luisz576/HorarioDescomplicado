import { Either, left, right } from "../../core/types/either"
import GetScheduleOrganizerData, { ScheduleOrganizerRunnerProps } from "../usecase/schedule_organizer/get_schedule_organizer_data"
import { Worker } from "worker_threads"

export default class ScheduleOrganizerState{
  constructor(
    private getScheduleOrganizerData: GetScheduleOrganizerData
  ){}

  authenticated = false
  clientId: string | undefined
  projectId: number = -1

  async #executer(emiter: (data: any) => void, onDone: () => void, onError: (error: any) => void){
    const resGeneticData = await this.createGeneticData()
    if(resGeneticData.isRight()){
      // Create a Worker
      const worker = new Worker('./src/app/socket/schedule_organizer_worker.ts', {
        workerData: {
          phenotypeProps: resGeneticData.value.props,
          geneticConfiguration: resGeneticData.value.configuration,
        }
      })
      worker.on('message', (value) => {
        if(value == 200){
          onDone()
          return
        }
        emiter(value)
      })
      worker.on("error", (msg) => {
        console.error("Erro na thread")
        onError(msg)
      });
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
    // ! TODO:
  }

  generate(emiter: (data: any) => void, onDone: () => void, onError: (error: any) => void, projectId: number){
    this.projectId = projectId
    this.#executer(emiter, onDone, onError)
  }
}
