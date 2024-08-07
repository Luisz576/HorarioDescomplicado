import { Either } from "../../../../types/either";
import ISchedule from "../../../model/ischedule";

export interface ScheduleUpdate{
  duration: number
}

export default interface IScheduleRepository{
  get(scheduleId: number): Promise<Either<any, ISchedule | null>>
  delete(scheduleId: number): Promise<Either<any, boolean>>
  create(): Promise<Either<any, ISchedule>>
  update(scheduleId: number, data: ScheduleUpdate): Promise<Either<any, boolean>>
}
