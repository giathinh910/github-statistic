import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptorService implements HttpInterceptor {
  constructor(private authService: AuthService) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (this.authService.accessToken) {
      req = req.clone({ setHeaders: { Authorization: `token ${this.authService.accessToken}` } });
    }
    req = req.clone({
      setHeaders: {
        'Content-Type': 'application/json',
        Accept: 'application/vnd.github.v3+json'
      }
    });
    return next.handle(req);
  }
}
