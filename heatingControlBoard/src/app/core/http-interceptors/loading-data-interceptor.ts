import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpEvent,
  HttpHandler,
  HttpRequest,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { HeatControlService } from 'src/app/heat-control/shared/heat-control.service';
import { finalize } from 'rxjs/operators';

@Injectable()
export class LoadingDataInterceptor implements HttpInterceptor {
  constructor(private heatControlService: HeatControlService) {}
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (
      !(req.url.includes('get_Sensor_Stats_In_Date_Range') ||
      req.url.includes('get_Sensors_Statistics'))
    )
      return next.handle(req);
    this.heatControlService.loadingStatsData = true;
    return next
      .handle(req)
      .pipe(finalize(() => (this.heatControlService.loadingStatsData = false)));
  }
}
