import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './http-interceptors/token.interceptor';
import { SharedModule } from '../shared/shared.module';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSidenavModule } from '@angular/material/sidenav';
import { UserAccessComponent } from './user-access/user-access.component';
import { RegisterDialogComponent } from './register-dialog/register-dialog.component';
import { LoginDialogComponent } from './login-dialog/login-dialog.component';

@NgModule({
  declarations: [LoginDialogComponent, UserAccessComponent, RegisterDialogComponent],
  imports: [
    CommonModule,
    HttpClientModule,
    SharedModule
  ],
  exports:[
    CommonModule,
    HttpClientModule,
    SharedModule
  ],
  providers:[
  ],
})
export class CoreModule { }
