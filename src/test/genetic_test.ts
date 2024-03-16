import ScheduleOrganizerGenetic from "../core/schedule_organizer/schedule_organizer_genetic";

async function run(){
  const g = new ScheduleOrganizerGenetic({
    classrooms: [
      {
        acceptedSubjects: [
          {
            subjectId: 0,
            classes: 4
          },
          {
            subjectId: 1,
            classes: 4
          }
        ]
      },
      {
        acceptedSubjects: [
          {
            subjectId: 0,
            classes: 4
          },
          {
            subjectId: 2,
            classes: 4
          }
        ]
      }
    ],
    days: [
      {
        day: 'MONDAY',
        classes: 4
      },
      {
        day: 'TUESDAY',
        classes: 4
      },
      {
        day: 'WEDNESDAY',
        classes: 4
      },
      {
        day: 'THUSDAY',
        classes: 4
      },
      {
        day: 'FRIDAY',
        classes: 4
      }
    ],
    subjects: [
      {
        id: 0,
        configuration: {
          maxConsecutiveClasses: 4,
          minConsecutiveClasses: 2,
          preferMaxConsecutiveClasses: true
        },
        teacherId: 3
      },
      {
        id: 1,
        configuration: {
          maxConsecutiveClasses: 4,
          minConsecutiveClasses: 2,
          preferMaxConsecutiveClasses: false
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
        teacherId: 3
      }
    ],
    teachers: [
      {
        id: 3
      },
      {
        id: 1
      }
    ]
  }, {
    mutationRate: 0.1,
    populationSize: 200,
    randomIndividualSize: 0,
    rankSlice: 1,
    roundsOfRoulette: 1,
    selectionMethod: 'COMPETITION',
    stopMethod: 'GENERATIONS_WITHOUT_BETTER_SCORE',
    maxOrWithoutBetterGenerations: 100,
  })

  await g.evolve()

  console.log('Classe 1, Dia 1:', g.bestPhenotype()!.classrooms[0].days[0])
  console.log('Classe 1, Dia 2:', g.bestPhenotype()!.classrooms[0].days[1])
  console.log('Classe 1, Dia 3:', g.bestPhenotype()!.classrooms[0].days[2])
  console.log('Classe 1, Dia 4:', g.bestPhenotype()!.classrooms[0].days[3])
  console.log('Classe 1, Dia 5:', g.bestPhenotype()!.classrooms[0].days[4])
  console.log('===========================================================')
  console.log('Classe 2, Dia 1:', g.bestPhenotype()!.classrooms[1].days[0])
  console.log('Classe 2, Dia 2:', g.bestPhenotype()!.classrooms[1].days[1])
  console.log('Classe 2, Dia 3:', g.bestPhenotype()!.classrooms[1].days[2])
  console.log('Classe 2, Dia 4:', g.bestPhenotype()!.classrooms[1].days[3])
  console.log('Classe 2, Dia 5:', g.bestPhenotype()!.classrooms[1].days[4])

  g.printTest()
}

run()
