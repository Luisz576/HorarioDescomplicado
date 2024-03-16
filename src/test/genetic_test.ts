import ScheduleOrganizerGenetic from "../core/schedule_organizer/schedule_organizer_genetic";

async function run(){
  const g = new ScheduleOrganizerGenetic({
    classrooms: [
      {
        acceptedSubjects: [
          {
            subjectId: 0,
            classes: 2
          },
          {
            subjectId: 1,
            classes: 2
          }
        ],
        days: ['MONDAY', 'TUESDAY', 'WEDNESDAY']
      },
      {
        acceptedSubjects: [
          {
            subjectId: 0,
            classes: 2
          },
          {
            subjectId: 2,
            classes: 2
          }
        ],
        days: ['MONDAY', 'TUESDAY', 'WEDNESDAY']
      }
    ],
    subjects: [
      {
        id: 0,
        configuration: {
          maxConsecutiveClasses: 4,
          minConsecutiveClasses: 2,
          preferMaxConsecutiveClasses: false
        },
        teacherId: 0
      },
      {
        id: 1,
        configuration: {
          maxConsecutiveClasses: 4,
          minConsecutiveClasses: 2,
          preferMaxConsecutiveClasses: true
        },
        teacherId: 1
      },
      {
        id: 2,
        configuration: {
          maxConsecutiveClasses: 4,
          minConsecutiveClasses: 2,
          preferMaxConsecutiveClasses: false
        },
        teacherId: 0
      }
    ],
    teachers: [
      {
        id: 0
      },
      {
        id: 1
      }
    ]
  }, {
    mutationRate: 0.1,
    populationSize: 50,
    randomIndividualSize: 1,
    rankSlice: 1,
    roundsOfRoulette: 1,
    selectionMethod: 'COMPETITION',
    stopMethod: 'GENERATIONS_WITHOUT_BETTER_SCORE',
    maxOrWithoutBetterGenerations: 10,
  })

  await g.evolve()

  console.log('Classe 1, Dia 1:', g.bestPhenotype()!.classrooms[0].days[0])
  console.log('Classe 1, Dia 2:', g.bestPhenotype()!.classrooms[0].days[1])
  console.log('Classe 1, Dia 3:', g.bestPhenotype()!.classrooms[0].days[2])
  console.log('===========================================================')
  console.log('Classe 2, Dia 1:', g.bestPhenotype()!.classrooms[1].days[0])
  console.log('Classe 2, Dia 2:', g.bestPhenotype()!.classrooms[1].days[1])
  console.log('Classe 2, Dia 3:', g.bestPhenotype()!.classrooms[1].days[2])
}

run()