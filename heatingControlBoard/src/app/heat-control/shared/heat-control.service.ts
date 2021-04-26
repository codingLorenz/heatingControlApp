import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DateRange } from '@angular/material/datepicker';
import { of } from 'rxjs/internal/observable/of';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { HeatingConfig } from './heatingConfig.model';
import { ObjectId } from './objectid.model';
import { Sensor } from './sensor.model';

@Injectable({
  providedIn: 'root',
})
export class HeatControlService {
  
  baseUrl = environment.apiEndpoint;
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    }),
  };

  constructor(private http: HttpClient) {}

writeHeatingConfig(config:HeatingConfig) {
   return this.http.post(this.baseUrl+'write_Heating_Config',config,this.httpOptions)
  }

  getHeatingConfig(){
    return this.http.get(this.baseUrl+'get_Heating_Config')
  }

  get_Sensor_Data(_id: ObjectId) {
    
    return this.http.get(this.baseUrl + 'get_Sensor_Data/' + _id.$oid)
  }

  getSensors() {
    return this.http.get(this.baseUrl + 'get_Sensors')
    .pipe(
      map(data=> {return data}),
      catchError(error=>{
        console.error(error)
      
        return of([{temperature:NaN}])
      })
    );
  }

  getSensorStats(_id:ObjectId){
    return this.http.get(this.baseUrl+'get_Sensors_Statistics/'+_id.$oid)
  }

  getSensorStatsInDateRange(daterange:DateRange<Date>){
    return this.http.post(this.baseUrl+'get_Sensor_Stats_In_Date_Range',JSON.stringify({start:daterange.start,end:daterange.end}),this.httpOptions)
  }
  // updateSensor(sensor: Sensor) {
  //   return this.http.post<Sensor>(
  //     this.baseUrl + 'update_Sensor',
  //     JSON.stringify(sensor),
  //     this.httpOptions
  //   );
  // }

  getRelayStatus(_id: ObjectId) {
    return this.http.get(this.baseUrl + 'get_Relay_Status/' + _id.$oid);
  }

  getRelays() {
    return this.http.get(this.baseUrl+'get_Relays')
  }

  register_User(){
    return this.http.post(`${this.baseUrl}register`,{id:3,username:'hellowMan',password:'byeBye!'})
  }
}
