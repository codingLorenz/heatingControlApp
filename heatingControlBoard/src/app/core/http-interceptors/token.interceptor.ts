
import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(private authService:AuthService) {}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const headers = req.headers
            .set('Content-Type', 'application/json');
        if(localStorage.getItem('authToken')){
            if(this.authService.isTokenExpired(localStorage.getItem('expiresAt'))){
                this.authService.logoutUser()
            }
            const authReq = req.clone(
                {headers: req.headers.set('Authorization', localStorage.getItem('authToken'))}
            );
            return next.handle(authReq);
        }else{
            return next.handle(req)
        }
    }
}