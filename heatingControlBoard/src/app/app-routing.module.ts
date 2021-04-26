import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { UserAccessComponent } from './core/user-access/user-access.component';
import { HeatingOverviewComponent } from './heat-control/heating-overview/heating-overview.component';

const routes: Routes = [
  { path: 'login', component: UserAccessComponent },
  { path: 'home', component: HeatingOverviewComponent,canActivate:[AuthGuard]},
  { path: '**',redirectTo:'home'},
  { path: '',  redirectTo:'home',pathMatch: 'full'},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
