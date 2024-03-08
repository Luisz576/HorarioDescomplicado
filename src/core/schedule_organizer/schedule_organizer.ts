import IGenetic from "../../domain/genetic/igenetic";
import ScheduleOrganizerPhenotype from "./phenotype";

export default class ScheduleOrganizer{
  constructor(
    private genetic: IGenetic<ScheduleOrganizerPhenotype>
  ){}

  organize(){
    // TODO: criar conexão wensocket, ouvir conexão e desconexão, enviar resposta
  }
}
