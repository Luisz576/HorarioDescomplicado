const PONTUATION = {
  // penality
  emptyClassPenality: 1,
  differentAmountOfClassesPenality: 10,
  classesAtSameTimePenality: 20,
  minClassesPenality: 5,
  maxClassesPenality: 7,
  prefferMaxClassesPenality: 2,
  freeClassInMiddlePenality: 5,
  // TODO: same subject in many days
  // TODO: penalidade distancia de aulas do professor

  // reward
  prefferMaxClassesReward: 1,
  correctAmountOfClassesReward: 1,
  dayWithoutClassesReward: 2,
  teacherFreeDayReward: 1,
}

export default PONTUATION
