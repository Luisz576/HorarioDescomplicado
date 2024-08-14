import ScheduleOrganizerGenetic from "../../core/schedule_organizer/schedule_organizer_genetic"
import { Either, left, right } from "../../core/types/either"
import GetScheduleOrganizerData from "../usecase/schedule_organizer/get_schedule_organizer_data"

export default class ScheduleOrganizerState{
  constructor(
    private getScheduleOrganizerData: GetScheduleOrganizerData
  ){}

  authenticated = false
  projectId: number = -1
  #genetic: ScheduleOrganizerGenetic | undefined

  async generate(emiter: (data: any) => void, onDone: () => void, onError: (error: any) => void, projectId: number){
    this.projectId = projectId

    const wasCreatedRes = await this.#createGenetic()
    if(wasCreatedRes.isLeft()){
      return onError("Couln't start generating")
    }

    if(this.#genetic){
      this.#genetic.evolve(
        this.#generationCallback.bind(this, emiter)
      ).then(() => {
        onDone()
      }).catch((e) => {
        onError(e)
      })
    }else{
      onError("Couln't start generating")
    }
  }

  #generationCallback(emiter: (data: any) => void, generation: number): boolean{
    if(generation % 5 == 0){
      if(this.#genetic){
        const bestPhenotype = this.#genetic.bestPhenotype()
        emiter({
          generation: generation,
          classrooms: bestPhenotype
        })
      }
    }
    return true
  }

  async #createGenetic(): Promise<Either<any, boolean>>{
    // load data
    const res = await this.getScheduleOrganizerData.exec(this.projectId)

    if(res.isRight()){
      const so = res.value
      this.#genetic = new ScheduleOrganizerGenetic(so.props, so.configuration)
      return right(true)
    }

    return left(res.value)
  }
}


/*

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
            classes: 4
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
          maxConsecutiveClasses: 4,
          minConsecutiveClasses: 2,
          preferMaxConsecutiveClasses: false
        },
        teacherId: 5
      },
      {
        id: 6,
        configuration: {
          maxConsecutiveClasses: 3,
          minConsecutiveClasses: 2,
          preferMaxConsecutiveClasses: false
        },
        teacherId: 4
      },
      {
        id: 7,
        configuration: {
          maxConsecutiveClasses: 3,
          minConsecutiveClasses: 2,
          preferMaxConsecutiveClasses: false
        },
        teacherId: 6
      },
      {
        id: 8,
        configuration: {
          maxConsecutiveClasses: 4,
          minConsecutiveClasses: 2,
          preferMaxConsecutiveClasses: false
        },
        teacherId: 7
      },
      {
        id: 9,
        configuration: {
          maxConsecutiveClasses: 3,
          minConsecutiveClasses: 2,
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
    populationSize: 350,
    randomIndividualSize: 2,
    rankSlice: 5,
    roundsOfRoulette: 1,
    selectionMethod: "RANK",
    stopMethod: 'GENERATIONS_WITHOUT_BETTER_SCORE',
    maxOrWithoutBetterGenerations: 250,
  })


*/
