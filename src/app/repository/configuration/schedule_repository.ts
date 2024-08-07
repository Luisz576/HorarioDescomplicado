import IScheduleRepository, { ScheduleUpdate } from "../../../core/domain/contracts/repository/configuration/ischedule_repository"
import ISchedule from "../../../core/domain/model/ischedule"
import { Either, left, right } from "../../../core/types/either"
import prisma from "../../service/prisma"

class ScheduleRepository implements IScheduleRepository{
  async update(scheduleId: number, data: ScheduleUpdate): Promise<Either<any, boolean>> {
    try{
      await prisma.projectSchedule.update({
        where: {
          id: scheduleId
        },
        data: data
      })
      return right(true)
    }catch(e){
      return left(e)
    }
  }
  async create(): Promise<Either<any, ISchedule>> {
    try{
      return right(
        await prisma.projectSchedule.create({
          data: {}
        })
      )
    }catch(e){
      return left(e)
    }
  }
  async get(scheduleId: number): Promise<Either<any, ISchedule | null>> {
    try{
      return right(
        await prisma.projectSchedule.findFirst({
          where: {
            id: scheduleId
          }
        })
      )
    }catch(e){
      return left(e)
    }
  }
  async delete(scheduleId: number): Promise<Either<any, boolean>>{
    try{
      return right(
        await prisma.projectSchedule.delete({
          where: {
            id: scheduleId
          }
        }) != undefined
      )
    }catch(e){
      return left(e)
    }
  }
}

const scheduleRepository = new ScheduleRepository()
export default scheduleRepository
