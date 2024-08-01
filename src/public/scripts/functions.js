function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

class ValueObject{
  #value
  #listeners = []
  constructor(initialValue){
    this.#value = initialValue
  }
  get(){
    return this.#value
  }
  set(value){
    this.#value = value
    this.#notity()
  }
  addListener(listener){
    this.#listeners.push(listener)
  }
  removeListener(listener){
    const i = this.#listeners.find(listener)
    if(i != undefined){
      this.#listeners.splice(i, i)
    }
  }
  #notity(){
    for(let i in this.#listeners){
      this.#listeners[i](this.#value)
    }
  }
}

function valueObject(value, initialListener = undefined){
  const vo = new ValueObject(value)
  if(initialListener){
    vo.addListener(initialListener)
  }
  return vo
}
