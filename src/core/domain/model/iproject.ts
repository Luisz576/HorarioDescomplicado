import IGeneticConfiguration from "./configuration/igenetic_configuration"

export default interface IProject{
  id: number
  name: string
  ownerId: string
  configurationId: number
}

export interface FullIProject{
  id: number
  name: string
  configuration: {
    preferFirstClasses: boolean,
    id: number,
    geneticConfiguration: IGeneticConfiguration
  }
}

export type PartialFullIProject = Partial<{
  id: number
  name: string
  configuration: Partial<{
    preferFirstClasses: boolean,
    id: number,
    geneticConfiguration: Partial<IGeneticConfiguration>
  }>
}>
