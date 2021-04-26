import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import {
  DateRange,
  MatDatepickerInputEvent,
} from '@angular/material/datepicker';
import { HeatControlService } from '../shared/heat-control.service';
import { Relay } from '../shared/relay.model';
import { Sensor } from '../shared/sensor.model';
import { HeatingConfig } from '../shared/heatingConfig.model';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-heating-overview',
  templateUrl: './heating-overview.component.html',
  styleUrls: ['./heating-overview.component.scss'],
})
export class HeatingOverviewComponent implements OnInit {
  sensors: Sensor[];
  relays: Relay[];
  // dimensions: [number, number] = [500, 500];
  all_sensor_stats: any[] = null;
  view_sensor_stats: any[] = null;
  graphOptions: string[] = ['Gesamt', 'Monat', 'Tag', 'Benutzerdefiniert'];
  active_sensor_data: any[] = null;
  heatingConfigForm_httpError: HttpErrorResponse;
  dateRangeOptions = ['Heute', 'Woche', 'Monat', 'Jahr'];

  heatingConfigFormGroup = new FormGroup({
    REGULATION_DURATION_SECONDS: new FormControl(1),
    REGULATION_INTERVALL_SECONDS: new FormControl(1),
    REGULATION_TEMPERATURE_TOLERANCE: new FormControl(1),
  });

  dateRange = new FormGroup({
    start: new FormControl(),
    end: new FormControl(),
  });

  constructor(private heatControlService: HeatControlService) {
    this.heatingConfigFormGroup.disable();
  }

  ngOnInit(): void {
    this.initHeatingConfig();
    this.initDevices();
  }
  initHeatingConfig() {
    this.heatControlService
      .getHeatingConfig()
      .subscribe((config) => console.log(config));
  }

  initDevices() {
    this.heatControlService.getRelays().subscribe(
      (data: Relay[]) => {
        this.relays = data;
        console.log(this.relays);
      },
      (error) => {
        console.log('caught error');
        return (this.relays = null);
      }
    );
    this.heatControlService.getSensors().subscribe(
      (data: Sensor[]) => {
        this.sensors = data;

        this.sensors.forEach((x) => {
          this.heatControlService
            .getSensorStats(x._id)
            .subscribe((sensor_stats) => {
              if (this.all_sensor_stats === null) this.all_sensor_stats = [];
              sensor_stats['series'].map(
                (dataItem: { name: string | number | Date }) => {
                  dataItem.name = new Date(dataItem.name);
                }
              );
              this.all_sensor_stats.push(sensor_stats);
              this.view_sensor_stats = [
                ...this.all_sensor_stats.filter((x) => x == x),
              ];
              console.log(sensor_stats);
              console.log('alle:');
              console.log(this.all_sensor_stats);
            });
        });

        // this.sensors.forEach(x=>{
        //   this.heatControlService.getSensorStats(x._id)
        //   .subscribe(stats=>{this.all_sensors_stats$
        //     .subscribe(stats=>{this.all_sensor_stats.push(stats)}
        //   }
      },
      (error) => {
        return (this.sensors = null);
      }
    );
  }

  dateTickFormatting(val: any): string {
    if (val instanceof Date) {
      var options = new Intl.DateTimeFormat();
      options.resolvedOptions();
      return (<Date>val).toLocaleString('de-AT', {
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  }

  statsDateRangeChanged(event: MatDatepickerInputEvent<Date>) {
    if (this.dateRange.value['start'] && this.dateRange.value['end']) {
      this.heatControlService
        .getSensorStatsInDateRange(
          new DateRange(
            this.dateRange.value['start'],
            this.dateRange.value['end']
          )
        )
        .subscribe((sensors_stats: any[]) => {
          console.log(sensors_stats);
          sensors_stats.forEach((sensorStatsItem) => {
            sensorStatsItem['series'].map(
              (dataItem) => (dataItem.name = new Date(dataItem.name))
            );
          });
          this.view_sensor_stats = sensors_stats;
        });
    }
  }

  submitHeatingConfigChanges() {
    const config: HeatingConfig = {
      REGULATION_DURATION_SECONDS: this.heatingConfigFormGroup.value
        .REGULATION_DURATION_SECONDS,
      REGULATION_INTERVALL_SECONDS: this.heatingConfigFormGroup.value
        .REGULATION_INTERVALL_SECONDS,
      REGULATION_TEMPERATURE_TOLERANCE: this.heatingConfigFormGroup.value
        .REGULATION_TEMPERATURE_TOLERANCE,
    };
    this.heatControlService.writeHeatingConfig(config).subscribe(
      () => {
        this.heatingConfigFormGroup.disable();
        this.heatingConfigForm_httpError = null;
      },
      (error) => {
        this.heatingConfigForm_httpError = error;
      }
    );
  }

  switchConfigEditing() {
    this.heatingConfigFormGroup.disabled
      ? this.heatingConfigFormGroup.enable()
      : this.heatingConfigFormGroup.disable();
  }

  statsDateRangeClicked(dateRangeOption:string) {
    console.log(dateRangeOption)
    const endPointDateRange = new Date();
    let startPointDateRange = null;
    switch (dateRangeOption) {
      case 'Heute':
        startPointDateRange = endPointDateRange
        break;
      case 'Woche':
        startPointDateRange = endPointDateRange.setDate(endPointDateRange.getDate()-endPointDateRange.getDay()) //substracts the days passed in the current week
        break;
      case 'Monat':
        startPointDateRange = endPointDateRange.setDate(endPointDateRange.getDate()-endPointDateRange.getDate()) //sets to first of the current month
        break;
      case 'Jahr':
        startPointDateRange = endPointDateRange.setFullYear(endPointDateRange.getFullYear(),1,1) //sets startPointDateRange to first of January, current year
        break;

      default:
        startPointDateRange = endPointDateRange
        break;
    }
    // this.heatControlService.getSensorStatsInDateRange()
  }
}
