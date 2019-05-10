import { Injectable } from '@angular/core';
import { Observable, of, defer } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { tap, retryWhen } from 'rxjs/operators';

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

  getRepoPullRequests(ownerAndRepo: string): Observable<any[]> {
    let pageNumber = 1;
    let complete = false;
    let listPullRequests = [];
    let params = new HttpParams({
      fromObject: {
        per_page: '100',
        page: '1',
        state: 'all'
      }
    });
    return defer(() => {
      if(!complete) {
        return this.httpClient.get<any[]>(
          `${this.githubApiUri}/repos/${ownerAndRepo}/pulls`, { params }
        );
      } else {
        return of(listPullRequests);
      }
    }).pipe(
      tap(response => {
        if(response.length && !complete) {
          pageNumber++;
          params = new HttpParams({
            fromObject: {
              per_page: '100',
              page: '' + pageNumber,
              state: 'all'
            }
          });
          throw response;
        }
        if(!response.length && !complete) {
          complete = true;
          throw response;
        }
      }),
      retryWhen(err => err.pipe(
        tap(pullRequests => {
          listPullRequests = listPullRequests.concat(pullRequests);
        })
      ))
    )
  }

  getRepoCollaborators(ownerAndRepo: string): Observable<any[]> {
    return this.httpClient.get<any[]>(
      `${this.githubApiUri}/repos/${ownerAndRepo}/collaborators`
    );
  }

  getRepoPullRequest(ownerAndRepo: string, pullNumber: number): Observable<any[]> {
    return this.httpClient.get<any[]>(
      `${this.githubApiUri}/repos/${ownerAndRepo}/pulls/${pullNumber}`
    );
  }
}
