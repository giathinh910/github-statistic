import { Injectable } from '@angular/core';
import { ClientStorageService } from './client-storage.service';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticated = new BehaviorSubject<boolean>(this.hasAccessToken());

  constructor(private clientStorageService: ClientStorageService) {
  }

  get isAuthenticated$(): Observable<boolean> {
    return this.isAuthenticated.asObservable();
  }

  get accessToken(): string {
    return this.clientStorageService.getCookie('access_token');
  }

  setAuthStatus(value: boolean) {
    this.isAuthenticated.next(value);
  }

  logout() {
    this.clientStorageService.removeCookie('access_token');
    this.isAuthenticated.next(false);
    window.location.reload();
  }

  private hasAccessToken(): boolean {
    return !!this.clientStorageService.getCookie('access_token');
  }
}
