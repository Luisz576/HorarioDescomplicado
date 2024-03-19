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
          },
          {
            subjectId: 2,
            classes: 5
          },
          {
            subjectId: 3,
            classes: 3
          },
          {
            subjectId: 4,
            classes: 2
          },
        ]
      },
      {
        acceptedSubjects: [
          {
            subjectId: 5,
            classes: 4
          },
          {
            subjectId: 6,
            classes: 3
          },
          {
            subjectId: 7,
            classes: 3
          },
          {
            subjectId: 8,
            classes: 5
          },
          {
            subjectId: 9,
            classes: 3
          },
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
        teacherId: 2
      },
      {
        id: 3,
        configuration: {
          maxConsecutiveClasses: 3,
          minConsecutiveClasses: 2,
          preferMaxConsecutiveClasses: false
        },
        teacherId: 3
      },
      {
        id: 4,
        configuration: {
          maxConsecutiveClasses: 2,
          minConsecutiveClasses: 2,
          preferMaxConsecutiveClasses: false
        },
        teacherId: 4
      },
      {
        id: 5,
        configuration: {
          maxConsecutiveClasses: 2,
          minConsecutiveClasses: 4,
          preferMaxConsecutiveClasses: false
        },
        teacherId: 5
      },
      {
        id: 6,
        configuration: {
          maxConsecutiveClasses: 2,
          minConsecutiveClasses: 3,
          preferMaxConsecutiveClasses: false
        },
        teacherId: 4
      },
      {
        id: 7,
        configuration: {
          maxConsecutiveClasses: 2,
          minConsecutiveClasses: 3,
          preferMaxConsecutiveClasses: false
        },
        teacherId: 6
      },
      {
        id: 8,
        configuration: {
          maxConsecutiveClasses: 2,
          minConsecutiveClasses: 4,
          preferMaxConsecutiveClasses: false
        },
        teacherId: 7
      },
      {
        id: 9,
        configuration: {
          maxConsecutiveClasses: 2,
          minConsecutiveClasses: 3,
          preferMaxConsecutiveClasses: false
        },
        teacherId: 2
      }
    ],
    teachers: [
      {
        id: 0
      },
      {
        id: 1
      },
      {
        id: 2
      },
      {
        id: 3
      },
      {
        id: 4
      },
      {
        id: 5
      },
      {
        id: 6
      },
      {
        id: 7
      }
    ]
  }, {
    mutationRate: 0.1,
    populationSize: 150,
    randomIndividualSize: 0,
    rankSlice: 15,
    roundsOfRoulette: 1,
    selectionMethod: "RANK",
    stopMethod: 'GENERATIONS_WITHOUT_BETTER_SCORE',
    maxOrWithoutBetterGenerations: 200,
  })

  await g.evolve((generation) => {
    console.warn('generation:', generation)
    return true
  })

  console.log('Classe 1, Dia 1:', g.bestPhenotype()!.classrooms[0].days[0])
  console.log('Classe 1, Dia 2:', g.bestPhenotype()!.classrooms[0].days[1])
  console.log('Classe 1, Dia 3:', g.bestPhenotype()!.classrooms[0].days[2])
  console.log('Classe 1, Dia 4:', g.bestPhenotype()!.classrooms[0].days[3])
  console.log('Classe 1, Dia 5:', g.bestPhenotype()!.classrooms[0].days[4])
  console.log('============================')
  console.log('Classe 2, Dia 1:', g.bestPhenotype()!.classrooms[1].days[0])
  console.log('Classe 2, Dia 2:', g.bestPhenotype()!.classrooms[1].days[1])
  console.log('Classe 2, Dia 3:', g.bestPhenotype()!.classrooms[1].days[2])
  console.log('Classe 2, Dia 4:', g.bestPhenotype()!.classrooms[1].days[3])
  console.log('Classe 2, Dia 5:', g.bestPhenotype()!.classrooms[1].days[4])
}

run()
