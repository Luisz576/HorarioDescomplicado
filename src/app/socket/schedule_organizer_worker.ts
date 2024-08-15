import { isMainThread, parentPort, Worker, workerData } from 'worker_threads'
// import ScheduleOrganizerGenetic from '../../core/schedule_organizer/schedule_organizer_genetic'
import { ScheduleOrganizerRunnerProps } from '../usecase/schedule_organizer/get_schedule_organizer_data'
import ScheduleOrganizerGenetic from '../../core/schedule_organizer/schedule_organizer_genetic';

if(isMainThread){
  module.exports = async function scheduleOrganizerWorker(
    so: ScheduleOrganizerRunnerProps,
    onMessage: (msg: any) => void,
    onError: (error: any) => void,
    onDone: () => void,
    getWorker: (worker: Worker) => void,
  ){
    new Promise((resolve, reject) => {
      const worker = new Worker(__filename, {
        workerData: so,
      });
      getWorker(worker)

      worker.on('message', (msg) => {
        if(msg == 200){
          onDone()
          return resolve(msg)
        }
        onMessage(msg)
      });

      worker.on('error', (error) => {
        onError(error)
        resolve(100)
      });

      worker.on('exit', (code) => {
        if (code !== 0){
          onError(new Error(`Worker stopped with exit code ${code}`));
          resolve(100)
        }
      });
    });
  }
}else{
  const genetic = new ScheduleOrganizerGenetic(workerData.props, workerData.configuration)
  genetic.evolve((generation) => {
    if(generation % 10 == 0 || generation == 2){
      const bestPhenotype = genetic.bestPhenotype()
      if(bestPhenotype){
        const chunk = {
          classrooms: bestPhenotype.classrooms,
          generation: generation
        }
        parentPort?.postMessage(chunk)
      }else{
        console.error("BestPhenotype can't be undefined!")
        return false
      }
    }
    return true
  })
  .then(() => parentPort?.postMessage(200))
  .catch(() => parentPort?.postMessage(100))
}
