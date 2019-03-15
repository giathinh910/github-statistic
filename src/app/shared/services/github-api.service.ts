import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class GithubApiService {
  private githubApiUri = 'https://api.github.com';

  constructor(private httpClient: HttpClient) {
  }

  getCurrentUserRepos(page = '1'): Observable<any[]> {
    return this.httpClient.get<any[]>(
      `${this.githubApiUri}/users/giathinh910/repos`,
      {
        params: new HttpParams({
          fromObject: {
            per_page: '100',
            page
          }
        })
      }
    );
  }

  getOrgRepos(page = '1'): Observable<any[]> {
    return this.httpClient.get<any[]>(
      `${this.githubApiUri}/orgs/framgia/repos`,
      {
        params: new HttpParams({
          fromObject: {
            per_page: '100',
            page
          }
        })
      }
    );
  }

  getRepoPullRequests(page = '1', ownerAndRepo: string): Observable<any[]> {
    return this.httpClient.get<any[]>(
      `${this.githubApiUri}/repos/${ownerAndRepo}/pulls`,
      {
        params: new HttpParams({
          fromObject: {
            per_page: '100',
            page,
            state: 'all'
          }
        })
      }
    );
  }

  getRepoCollaborators(page = '1', ownerAndRepo: string): Observable<any[]> {
    return this.httpClient.get<any[]>(
      `${this.githubApiUri}/repos/${ownerAndRepo}/collaborators`,
      {
        params: new HttpParams({
          fromObject: {
            per_page: '100',
            page
          }
        })
      }
    );
  }

  getRepoPullRequest(page = '1', ownerAndRepo: string, pullNumber: number): Observable<any[]> {
    return this.httpClient.get<any[]>(
      `${this.githubApiUri}/repos/${ownerAndRepo}/pulls/${pullNumber}`,
      {
        params: new HttpParams({
          fromObject: {
            per_page: '100',
            page
          }
        })
      }
    );
  }
}
