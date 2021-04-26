import { Component, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { Router } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { HeatControlService } from './heat-control/shared/heat-control.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'heatingControlBoard';
  @ViewChild('sidenav') sidenav: MatSidenav;

  constructor(private authService:AuthService,private router:Router){}

  logout(){
    if (this.authService.logoutUser()) this.sidenav.toggle()
  }
}
