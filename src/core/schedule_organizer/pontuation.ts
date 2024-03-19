const PONTUATION = {
  // penality
  emptyClassPenality: 1,
  emptyClassInBegin: 4,
  differentAmountOfClassesPenality: 8,
  classesAtSameTimePenality: 10,
  minClassesPenality: 4,
  maxClassesPenality: 5,
  prefferMaxClassesPenality: 2,
}

export default PONTUATION
/*
Classe 1, Dia 1: { subjects: [ { id: 2 }, { id: 2 }, { id: 0 }, { id: 0 } ] }
Classe 1, Dia 2: { subjects: [ { id: 1 }, { id: 1 }, { id: 1 }, { id: 1 } ] }
Classe 1, Dia 3: { subjects: [ { id: 4 }, { id: 4 }, { id: 3 }, { id: -1 } ] }
Classe 1, Dia 4: { subjects: [ { id: -1 }, { id: 0 }, { id: 0 }, { id: -1 } ] }
Classe 1, Dia 5: { subjects: [ { id: 2 }, { id: 2 }, { id: 3 }, { id: 3 } ] }
============================
Classe 2, Dia 1: { subjects: [ { id: 5 }, { id: 5 }, { id: 5 }, { id: 9 } ] }
Classe 2, Dia 2: { subjects: [ { id: 9 }, { id: 6 }, { id: 6 }, { id: -1 } ] }
Classe 2, Dia 3: { subjects: [ { id: 8 }, { id: 8 }, { id: 8 }, { id: -1 } ] }
Classe 2, Dia 4: { subjects: [ { id: 6 }, { id: 8 }, { id: 8 }, { id: 9 } ] }
Classe 2, Dia 5: { subjects: [ { id: 7 }, { id: 7 }, { id: 7 }, { id: 5 } ] }
*/
