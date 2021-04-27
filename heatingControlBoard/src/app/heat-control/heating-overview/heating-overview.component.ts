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
    { time: 'Benutzerdefiniert', selected: false },
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

  constructor(public heatControlService: HeatControlService) {
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

  statsDateRangeChanged(event?: MatDatepickerInputEvent<Date>) {
    
    if(this.dateRangeFormGroup.value['start']===null || this.dateRangeFormGroup.value['end']===null || (this.dateRangeFormGroup.value['end'] < this.dateRangeFormGroup.value['start'])) return;
    this.heatControlService
      .getSensorStatsInDateRangeOrById(
        new DateRange(
          this.dateRangeFormGroup.value['start'],
          this.dateRangeFormGroup.value['end']
        )
      )
      .subscribe((sensor_stats) => (this.view_sensor_stats = sensor_stats));
  }

  toggleChipSelection(index: number) {
    this.dateRangeOptions.forEach((element) => (element.selected = false)); //removes any selection of chips
    this.dateRangeOptions[index].selected = true;
  }

  getChipByText(timetext: string) {
    return this.dateRangeOptions.find((elem) => elem.time == timetext);
  }

  chipStatsDateRangeClicked(dateRangeOption: string) {
    let endPointDateRange = new Date();
    let startPointDateRange = new Date();
    startPointDateRange.setUTCHours(0, 0, 0, 0); //0 hours,minutes,seconds,miliseconds
    switch (dateRangeOption) {
      case 'Heute':
        this.toggleChipSelection(
          this.dateRangeOptions.findIndex((element) => element.time == 'Heute')
        );
        break;
      case 'Woche':
        startPointDateRange.setUTCDate(
          endPointDateRange.getUTCDate() - endPointDateRange.getUTCDay()
        ); //substracts the days passed in the current week
        this.toggleChipSelection(
          this.dateRangeOptions.findIndex((element) => element.time == 'Woche')
        );
        break;
      case 'Monat':
        startPointDateRange.setUTCDate(
          endPointDateRange.getUTCDate() - endPointDateRange.getUTCDate() + 1 //so that it's first day not day zero
        ); //sets to first of the current month
        this.toggleChipSelection(
          this.dateRangeOptions.findIndex((element) => element.time == 'Monat')
        );
        break;
      case 'Jahr':
        startPointDateRange.setUTCFullYear(
          endPointDateRange.getUTCFullYear(),
          1,
          1
        ); //sets startPointDateRange to first day of first month (January), current year
        this.toggleChipSelection(
          this.dateRangeOptions.findIndex((element) => element.time == 'Jahr')
        );
        break;
      case 'Benutzerdefiniert':
        this.toggleChipSelection(
          this.dateRangeOptions.findIndex(
            (element) => element.time == 'Benutzerdefiniert'
          )
        );
        return;

      default:
        // startPointDateRange = endPointDateRange;
        break;
    }
    this.dateRangeFormGroup.setValue({
      start: startPointDateRange,
      end: endPointDateRange,
    });
    this.heatControlService
      .getSensorStatsInDateRangeOrById(
        new DateRange(startPointDateRange, endPointDateRange)
      )
      .subscribe((sensor_stats) => (this.view_sensor_stats = sensor_stats));
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
}
