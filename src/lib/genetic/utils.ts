export function randomInt(n: number): number{
  return Math.floor(Math.random() * n)
}

export function cloneJson<J>(json: J): J{
  return JSON.parse(JSON.stringify(json))
}
