export default function logError(error: any, where: string, func: string){
  console.log(`Error at '${where}' -> '${func}':`)
  console.error(error)
}
