export default function cloneJson<J>(json: J): J{
  return JSON.parse(JSON.stringify(json))
}
