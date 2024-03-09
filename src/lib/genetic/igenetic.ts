export default interface IGenetic<Phenotype>{
  isPopulationComplete(): boolean
  evolve(): IGenetic<Phenotype>
  bestPhenotypes(n?: number): Phenotype[]
  scores(ranked?: boolean): {score: number, phenotype: Phenotype}[]
  randomPhenotype(): Phenotype
  randomPhenotypes(n_phenotypes?: number): Phenotype[]
  population(): Phenotype[]
  clone(): IGenetic<Phenotype>
}
