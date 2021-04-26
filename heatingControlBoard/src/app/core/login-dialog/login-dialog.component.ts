import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { RegisterDialogComponent } from '../register-dialog/register-dialog.component';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login-dialog',
  templateUrl: './login-dialog.component.html',
  styleUrls: ['./login-dialog.component.scss']
})
export class LoginDialogComponent implements OnInit {
  login_form: FormGroup;
  form_httpError:HttpErrorResponse

  constructor(
    fb: FormBuilder,
    public authService: AuthService,
    private router: Router,
    private dialogRef: MatDialog
  ) {
    this.login_form = fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  ngOnInit(): void {}
  login() {
    this.login_form.setErrors(null)
    const form_val = this.login_form.value;
    if (this.login_form.valid) {
      this.authService
        .loginUser(form_val.username, form_val.password)
        .subscribe(
          (res) => {
            this.dialogRef.closeAll();
            this.router.navigateByUrl('/home');
          },
          (error) => {
            console.log(error)
            if (error && error.status == 401) {
              this.login_form.setErrors({ unauthorized: true });
            }else if(error.status == 0){
              this.login_form.setErrors({unknown:true})
            }
            else{
              this.login_form.setErrors({invalid:true})
              this.form_httpError = error
            }
          }
        );
    }
  }

  register(){
    this.dialogRef.closeAll()
    this.dialogRef.open(RegisterDialogComponent)
  }
}
