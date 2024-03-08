export default interface IGenetic<Phenotype>{
  evolve(): IGenetic<Phenotype>
  elite(n_elite?: number): Phenotype[]
  scores(ranked?: boolean): {score: number, phenotype: Phenotype}[]
  randomPhenotype(): Phenotype
  randomPhenotypes(n_phenotypes?: number): Phenotype[]
  population(): Phenotype[]
  clone(): IGenetic<Phenotype>
}
