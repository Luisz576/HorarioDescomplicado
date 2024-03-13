export type SelectionMethod = "RANK" | "ROULETTE" | "COMPETITION"
export type StopMethod = "MAX_GENERATIONS" | "GENERATIONS_WITHOUT_BETTER_SCORE"

export default interface IGeneticConfiguration{
  id: number
  populationSize: number
  rankSlice: number
  randomIndividualSize: number
  mutationRate: number
  roundsOfRoulette: number
  selectionMethod: SelectionMethod
  stopMethod: StopMethod
}
