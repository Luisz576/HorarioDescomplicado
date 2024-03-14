export type DayOfWeek = 'SUNDAY' | 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THUSDAY' | 'FRIDAY' | 'SATURDAY'
export function getDayOfWeekFromInt(d: number): DayOfWeek{
  switch(d){
    case 1:
      return 'SUNDAY'
    case 2:
      return 'MONDAY'
    case 3:
      return 'THUSDAY'
    case 4:
      return 'WEDNESDAY'
    case 5:
      return 'THUSDAY'
    case 6:
      return 'FRIDAY'
    case 7:
      return 'SATURDAY'
  }
  return 'SUNDAY'
}

export type SelectionMethod = 'MAX_GENERATIONS' | 'GENERATIONS_WITHOUT_BETTER_SCORE'
