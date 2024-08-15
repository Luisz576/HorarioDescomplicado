import MetaScheduleOrganizerPhenotype from "../../core/schedule_organizer/phenotype/meta_phenotype";

export function meta_phenotype_to_json(phenotype: MetaScheduleOrganizerPhenotype){
  const classrooms: any[] = []
  for(let c of phenotype.classrooms.keys()){
    const croom = phenotype.classrooms.get(c)
    if(!croom) continue

    classrooms.push({
      id: croom.realId,
      schedule: Array.from(croom.schedule.values())
    })
  }
  return {
    classrooms: classrooms
  }
}
