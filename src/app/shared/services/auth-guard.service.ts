import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {
  constructor(private router: Router,
              private authService: AuthService) {
  }

  canActivate(): Observable<boolean> {
    return this.authService.isAuthenticated
      .pipe(
        map((isAuth: boolean) => {
          if (!isAuth) {
            this.router.navigate(['authenticate']);
            return false;
          }
          return true;
        })
      );
  }
}
