import { parentPort, workerData } from 'worker_threads'
import ScheduleOrganizerGenetic from '../../core/schedule_organizer/schedule_organizer_genetic'
import { Either, left } from '../../core/types/either'

class ScheduleOrganizerWorker{
  running = true
  genetic: ScheduleOrganizerGenetic | undefined

  async schedule_organizer_worker(){
    console.warn(workerData)
    setTimeout(() => parentPort?.postMessage(200), 10000)
    return
    this.genetic = new ScheduleOrganizerGenetic(workerData.phenotypeProps, workerData.geneticConfiguration)
    await workerData.genetic.evolve(this.geneticCallback.bind(this))
    parentPort?.postMessage(200)
  }

  geneticCallback(generation: number){
    if(generation % 10 == 0){
      if(this.genetic){
        const bestPhenotype = this.genetic.bestPhenotype()
        parentPort?.postMessage({
          generation: generation,
          classrooms: bestPhenotype
        })
      }
    }
    return this.running
  }

  work(){
    this.schedule_organizer_worker()
  }
}

const worker = new ScheduleOrganizerWorker()
worker.work()
