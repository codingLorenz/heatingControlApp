import { Component, Input, OnInit } from '@angular/core';
import { timer } from 'rxjs';
import { switchMapTo, retry, share } from 'rxjs/operators';
import { HeatControlService } from '../shared/heat-control.service';
import { Relay } from '../shared/relay.model';

@Component({
  selector: 'app-relay',
  templateUrl: './relay.component.html',
  styleUrls: ['./relay.component.scss'],
})
export class RelayComponent implements OnInit {
  @Input() relay: Relay

  constructor(private heatControlService: HeatControlService) {}

  ngOnInit(): void {
    this.subscribeToRefresh();
  }

  async subscribeToRefresh() {
    timer(0, 500)
      .pipe(
        switchMapTo(this.heatControlService.getRelayStatus(this.relay._id)),
        retry(5),
        share()
      )
      .subscribe((heating: boolean) => {
        this.relay.heating = heating;
      });
  }
}
