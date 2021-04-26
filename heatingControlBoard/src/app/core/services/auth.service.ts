import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  baseUrl = environment.apiEndpoint;

  constructor(private http: HttpClient, private router: Router) {}

  loginUser(username: string, password: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Authorization': `Basic ` + btoa(`${username}:${password}`),
      }),
    };
    return this.http.post<any>(this.baseUrl + 'login', {}, httpOptions).pipe(
      map((response) => {
        const authToken = response.token;
        const expiresAt = new Date(
          JSON.parse(atob(authToken.split('.')[1])).exp * 1000
        );
        console.log('token expires at: ' + expiresAt);
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('expiresAt', expiresAt.toUTCString());
        return response;
      })
    );
  }

  isLoggedIn() {
    const expTime = new Date(localStorage.getItem('expiresAt'));
    const now = Date.now();
    if(this.isTokenExpired(localStorage.getItem('expiresAt'))){ localStorage.clear(); return false;}
    if(localStorage.getItem('authToken')==null) return false;
    return true;
  }

  logoutUser() {
    if (localStorage.getItem('authToken') == null) return false;
    localStorage.removeItem('authToken');
    localStorage.removeItem('expiresAt');
    this.router.navigateByUrl('login')
    return true;
  }

  register() {
    this.http.post;
  }

  isTokenExpired(expireUTCTime: string): boolean {
    if (new Date(expireUTCTime).getTime() <= Date.now()) return true;
    return false;
  }
}
