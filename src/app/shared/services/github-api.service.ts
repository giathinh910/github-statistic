import { Injectable } from '@angular/core';
import { Observable, of, defer } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { tap, retryWhen, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class GithubApiService {
  private githubApiUri = 'https://api.github.com';
  private repoes: {
    ownerAndRepo: string;
    pullRequests?: any[];
    collaborators?: any[];
  }[] = [];

  constructor(private httpClient: HttpClient) {
  }

  getRepoPullRequests(ownerAndRepo: string): Observable<any[]> {
    let pageNumber = 1;
    let complete = false;
    let pullRequests = [];
    let params = new HttpParams({
      fromObject: {
        per_page: '100',
        page: '1',
        state: 'all'
      }
    });
    const repoIndex = this.repoes.findIndex(repo => {
      return repo.ownerAndRepo === ownerAndRepo;
    });
    if (repoIndex > -1) {
      return of(this.repoes[repoIndex].pullRequests);
    }
    return defer(() => {
      if (!complete) {
        return this.httpClient.get<any[]>(
          `${this.githubApiUri}/repos/${ownerAndRepo}/pulls`, { params }
        );
      } else {
        this.repoes.push({
          ownerAndRepo,
          pullRequests
        }); // cache
        return of(pullRequests);
      }
    }).pipe(
      catchError((err) => {
        return of(err);
      }),
      tap(response => {
        if (response.length && !complete) {
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
        if (!response.length && !complete) {
          complete = true;
          throw response;
        }
      }),
      retryWhen(err => err.pipe(
        tap(pulls => {
          pullRequests = pullRequests.concat(pulls);
        })
      ))
    );
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
