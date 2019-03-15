import { Component, OnInit } from '@angular/core';
import { environment } from '../../environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../shared/services/api.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ClientStorageService } from '../shared/services/client-storage.service';
import { AuthService } from '../shared/services/auth.service';

@Component({
  selector: 'fe-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {
  oauthUri = `https://github.com/login/oauth/authorize?client_id=${environment.clientId}&redirect_uri=${environment.redirectUri}/authenticate&scope=repo`;
  errorMessage: string;
  exchangingAccessToken = false;

  constructor(private activatedRoute: ActivatedRoute,
              private apiService: ApiService,
              private clientStorageService: ClientStorageService,
              private router: Router,
              private authService: AuthService) {
  }

  ngOnInit() {
    this.getOAuthCodeFromUrl();
  }

  private getOAuthCodeFromUrl() {
    this.activatedRoute.queryParams.subscribe(params => {
      if (params && params.code) {
        this.exchangingAccessToken = true;
        this.exchangeAccessToken(params.code);
      }
    });
  }

  private exchangeAccessToken(code: string) {
    this.apiService.getAccessToken(code).subscribe(
      (res: any) => {
        this.clientStorageService.setCookie('access_token', res.access_token, 1);
        this.authService.setAuthStatus(true);
        this.router.navigate(['/']);
      },
      (err: HttpErrorResponse) => this.errorMessage = err.error.message
    );
  }
}
