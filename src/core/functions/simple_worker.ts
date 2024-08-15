import path from "path";
import { Worker } from "worker_threads";

export default class SimpleWorker{
  worker: Worker

  constructor(filepath: string, workerData: any){
    this.worker = new Worker(filepath, { workerData })
  }

  onMessage(listener: (msg: any) => void){
    this.worker.on("message", listener)
  }

  onError(listener: (msg: any) => void){
    this.worker.on("error", listener)
  }

  onExit(listener: (msg: any) => void){
    this.worker.on("exit", listener)
  }

  emitMessage(msg: any){
    this.worker.emit("message", msg)
  }

  postMessage(msg: any){
    this.worker.postMessage(msg)
  }
}
