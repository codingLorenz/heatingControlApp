import { Component, Input, OnInit, ViewChild } from '@angular/core';
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
import { MatButton } from '@angular/material/button';
import { element } from 'protractor';

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
  active_sensor_data: any[] = null;
  dateRangeOptions = [
    { time: 'Heute', selected: true },
    { time: 'Woche', selected: false },
    { time: 'Monat', selected: false },
    { time: 'Jahr', selected: false },
  ];

  heatingConfigForm_httpError: HttpErrorResponse;
  heatingConfigFormGroup = new FormGroup({
    REGULATION_DURATION_SECONDS: new FormControl(),
    REGULATION_INTERVALL_SECONDS: new FormControl(),
    REGULATION_TEMPERATURE_TOLERANCE: new FormControl(),
  });

  dateRangeFormGroup = new FormGroup({
    start: new FormControl(),
    end: new FormControl(),
  });

  constructor(private heatControlService: HeatControlService) {
    this.heatingConfigFormGroup.disable();
  }

  ngOnInit(): void {
    this.initHeatingConfig();
    this.initDevices();
    this.chipStatsDateRangeClicked(
      this.dateRangeOptions.find((elem) => elem.selected == true).time
    );
  }
  initHeatingConfig() {
    this.heatControlService.getHeatingConfig().subscribe((config) => {
      this.heatingConfigFormGroup.setValue(config);
    });
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
    if (
      this.dateRangeFormGroup.value['start'] &&
      this.dateRangeFormGroup.value['end']
    ) {
      this.heatControlService
        .getSensorStatsInDateRange(
          new DateRange(
            this.dateRangeFormGroup.value['start'],
            this.dateRangeFormGroup.value['end']
          )
        )
        .subscribe((sensors_stats: any[]) => {
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

  chipStatsDateRangeClicked(dateRangeOption: string) {
    const endPointDateRange = new Date();
    let startPointDateRange = new Date();
    this.dateRangeOptions.forEach((element) => (element.selected = false)); //removes any selection of chips

    switch (dateRangeOption) {
      case 'Heute':
        startPointDateRange.setUTCHours(0, 0, 0, 0); //0hours,minutes,seconds,miliseconds
        this.dateRangeOptions.find(
          (element) => element.time == 'Heute'
        ).selected = true;
        break;
      case 'Woche':
        startPointDateRange.setUTCDate(
          endPointDateRange.getUTCDate() - endPointDateRange.getUTCDay()
        ); //substracts the days passed in the current week
        this.dateRangeOptions.find(
          (element) => element.time == 'Woche'
        ).selected = true;
        break;
      case 'Monat':
        startPointDateRange.setUTCDate(
          endPointDateRange.getUTCDate() - endPointDateRange.getUTCDate()
        ); //sets to first of the current month
        this.dateRangeOptions.find(
          (element) => element.time == 'Monat'
        ).selected = true;
        break;
      case 'Jahr':
        startPointDateRange.setUTCFullYear(
          endPointDateRange.getUTCFullYear(),
          1,
          1
        ); //sets startPointDateRange to first day of first month (January), current year
        this.dateRangeOptions.find(
          (element) => element.time == 'Jahr'
        ).selected = true;
        break;

      default:
        startPointDateRange = endPointDateRange;
        break;
    }
    this.dateRangeFormGroup.setValue({
      start: startPointDateRange,
      end: endPointDateRange,
    });
    this.heatControlService
      .getSensorStatsInDateRange(
        new DateRange(startPointDateRange, endPointDateRange)
      )
      .subscribe((sensor_stats) => (this.view_sensor_stats = sensor_stats));
  }
}
