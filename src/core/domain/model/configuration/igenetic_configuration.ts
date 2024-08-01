export type SelectionMethod = "RANK" | "ROULETTE" | "COMPETITION"

export function selectionMethodFromId(id: number): SelectionMethod | undefined{
  switch(id){
    case 0:
      return "RANK"
    case 1:
      return "COMPETITION"
  }
}

export type StopMethod = "MAX_GENERATIONS" | "GENERATIONS_WITHOUT_BETTER_SCORE"

export function stopMethodFromId(id: number): StopMethod | undefined{
  switch(id){
    case 0:
      return "MAX_GENERATIONS"
    case 1:
      return "GENERATIONS_WITHOUT_BETTER_SCORE"
  }
}

export default interface IGeneticConfiguration{
  id: number
  populationSize: number
  rankSlice: number
  randomIndividualSize: number
  mutationRate: number
  roundsOfRoulette: number
  maxOrWithoutBetterGenerations: number
  selectionMethod: SelectionMethod
  stopMethod: StopMethod
}
