export type TrainingMethod = "RANK" | "ROULETTE" | "COMPETITION"
export type StopMethod = "MAX_GENERATIONS" | "GENERATIONS_WITHOUT_BETTER_SCORE"

export default interface IGeneticConfiguration{
  id: string
  populationSize: number
  eliteSize: number
  randomIndividualSize: number
  mutationRate: number
  trainingMethod: TrainingMethod
  stopMethod: StopMethod
}
