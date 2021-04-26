import { EventEmitter } from '@angular/core';
import { Component, Input, OnInit, Output } from '@angular/core';
import { interval, Observable, timer } from 'rxjs';
import { retry, switchMapTo, share } from 'rxjs/operators';
import { HeatControlService } from '../shared/heat-control.service';
import { Relay } from '../shared/relay.model';
import { Sensor } from '../shared/sensor.model';

@Component({
  selector: 'app-sensor',
  templateUrl: './sensor.component.html',
  styleUrls: ['./sensor.component.scss'],
})
export class SensorComponent implements OnInit {
  @Input() sensor: Sensor;
  @Output() changeRelayStatus: Relay;

  colorScheme = {
    domain: ['#5AA454', '#E44D25'],
  };
  constructor(private heatControlService: HeatControlService) {}

  ngOnInit(): void {
    this.subscribeToRefresh();
  }

  ngOnDestroy(){
    
  }

  async subscribeToRefresh() {
    timer(0, 5000)
      .pipe(
        switchMapTo(this.heatControlService.get_Sensor_Data(this.sensor._id)),
        retry(5),
        share()
      )
      .subscribe((sensor:Sensor) => {
        this.sensor = sensor;
      });
  }

  // idealTemperatureChanged() {
  //   this.heatControlService
  //     .updateSensor(this.sensor)
  //     .subscribe((response) => console.log(response));
  // }

  valueFormatting = (value:number)=>{
    return value+"".slice(0,-2)
  }

  registerUser(){
    console.log("----------------------------- register user ------------------------------------")
    this.heatControlService.register_User().subscribe(res=>console.log(res))
  }
}
