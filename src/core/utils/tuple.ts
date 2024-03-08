export class Tuple<A, B>{
  constructor(
    public a: A,
    public b: B
  ){}

  clone(){
    return new Tuple(this.a, this.b)
  }
}

export default function tuple<A, B>(a: A, b: B){
  return new Tuple(a, b)
}
