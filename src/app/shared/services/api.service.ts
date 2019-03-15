import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  apiUri = environment.apiUri;

  constructor(private httpClient: HttpClient) {
  }

  getAccessToken(code: string) {
    return this.httpClient.get(
      `${this.apiUri}/auth`,
      {
        params: {
          code
        }
      }
    );
  }
}
