import { ObjectId } from "./objectid.model";

export interface Sensor{
    _id:ObjectId
    temperature : number
    idealTemperature:number
    tolerance:number
    name:string
    registerAddress:number
}