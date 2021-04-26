import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SensorComponent } from './sensor/sensor.component';
import { RelayComponent } from './relay/relay.component';
import { HeatingOverviewComponent } from './heating-overview/heating-overview.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [SensorComponent, RelayComponent, HeatingOverviewComponent],
  imports: [
    CommonModule,
    SharedModule
    
  ],
  exports:[
    HeatingOverviewComponent
  ]
})
export class HeatControlModule { }
