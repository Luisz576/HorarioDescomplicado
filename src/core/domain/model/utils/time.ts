import { DayOfWeek } from "../../../utils/utils"

export default interface Time{
  id: number
  day: DayOfWeek
  startTime: number
  endTime: number
  scheduleId: number
}

export const maxTime = 144
// A day will have 24 * 6 = 144 spaces (each 10 minutes)
