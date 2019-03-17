import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUri = environment.apiUri;

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
