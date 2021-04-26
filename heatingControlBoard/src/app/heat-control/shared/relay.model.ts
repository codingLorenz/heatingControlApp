import { ObjectId } from "./objectid.model";

export interface Relay{
    _id:ObjectId
    heating:boolean
    name:string
    registerAddress:number
}