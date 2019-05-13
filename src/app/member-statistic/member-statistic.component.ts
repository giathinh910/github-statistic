import { Component, OnInit, SimpleChanges } from '@angular/core';
import { GithubApiService } from '../shared/services/github-api.service';
import { ActivatedRoute, Router } from '@angular/router';
import { concatMap, distinctUntilChanged, finalize, map, tap } from 'rxjs/operators';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import * as moment from 'moment';
import { forkJoin, Observable, of } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { Moment } from 'moment';

@Component({
  selector: 'fe-member-statistic',
  templateUrl: './member-statistic.component.html',
  styleUrls: ['./member-statistic.component.scss']
})
export class MemberStatisticComponent implements OnInit {
  pullRequests: any[];
  filteredByUserPullRequests: any[];
  page = '1';
  isLoadingCollaborators = false;
  isLoadingPullRequests = false;
  statisticFilterForm: FormGroup;
  errorMessage: string;
  errorMessageCollaborator: string;
  isShowNotiCopyData = false;
  private currentDay = moment();
  private ownerAndRepo: string;

  constructor(private githubApiService: GithubApiService,
              private activatedRoute: ActivatedRoute,
              private router: Router,
              private formBuilder: FormBuilder) {
  }

  ngOnInit() {
    this.listenForRoute();
    this.genForm();
    this.listenForRepoUrlChange();
  }

  handleDateChange() {
    this.getAllPullRequests();
  }

  handleCollaboratorCheckboxChecked() {
    if (!this.pullRequests) {
      return;
    }
    this.filterPullRequestsBySelectedCollaborators();
  }

  get collaboratorsFormArray(): FormArray {
    return this.statisticFilterForm.get('collaborators') as FormArray;
  }

  prevWeek() {
    const dayTemp = moment(this.currentDay.subtract(7, "day"));
    this.statisticFilterForm.get('startDate').setValue(this.mondayOfWeek(dayTemp));
    this.statisticFilterForm.get('endDate').setValue(this.sundayOfWeek(dayTemp));
    this.getAllPullRequests();
  }
  
  nextWeek() {
    const dayTemp = moment(this.currentDay.add(7, "day"));
    this.statisticFilterForm.get('startDate').setValue(this.mondayOfWeek(dayTemp));
    this.statisticFilterForm.get('endDate').setValue(this.sundayOfWeek(dayTemp));
    this.getAllPullRequests();
  }

  private mondayOfWeek(currentDay): NgbDateStruct {
    const mondayMoment: Moment = moment(currentDay).startOf('isoWeek');
    const year = mondayMoment.year();
    const month = mondayMoment.month() + 1;
    const day = mondayMoment.date();
    return { year, month, day };
  }

  private sundayOfWeek(currentDay): NgbDateStruct {
    const sundayMoment: Moment = moment(currentDay).endOf('isoWeek');
    const year = sundayMoment.year();
    const month = sundayMoment.month() + 1;
    const day = sundayMoment.date();
    return { year, month, day };
  }

  private filterPullRequestsBySelectedCollaborators() {
    const selectedCollaborators: string[] = this.collaboratorsFormArray.value
      .filter(col => col.selected)
      .reduce((accumulator, collaborator) => {
        accumulator.push(collaborator.login);
        return accumulator;
      }, []);
    if (selectedCollaborators && selectedCollaborators.length) {
      this.filteredByUserPullRequests = this.pullRequests.filter(pull => {
        return selectedCollaborators.indexOf(pull.user.login) > -1;
      });
    } else {
      this.filteredByUserPullRequests = this.pullRequests;
    }
  }

  private getAllPullRequests() {
    if (this.isLoadingPullRequests) {
      return;
    }
    this.errorMessage = undefined;
    this.isLoadingPullRequests = true;
    this.githubApiService.getRepoPullRequests(this.ownerAndRepo)
      .pipe(
        map(pulls => pulls.filter(
          pull => this.doesPullRequestBelongToDateRange(pull)
        )),
        concatMap((pulls: any[]) => {
          const getCommits$: Observable<any>[] = [];
          if (!pulls.length) {
            return of([]);
          }
          pulls.forEach(
            pull => getCommits$.push(
              this.githubApiService.getRepoPullRequest(this.ownerAndRepo, pull.number)
            )
          );
          return forkJoin(getCommits$);
        }),
        finalize(() => this.isLoadingPullRequests = false)
      ).subscribe(
          pulls => {
            this.pullRequests = pulls;
            this.filterPullRequests();
            console.log(pulls)
          },
          (err: HttpErrorResponse) => {
            this.errorMessage = err.error.message;
          }
        );
  }

  private listenForRepoUrlChange() {
    this.statisticFilterForm
      .get('githubRepoURL')
      .valueChanges
      .pipe(distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)))
      .subscribe((githubRepoURL: string) => {
        if (githubRepoURL) {
          this.ownerAndRepo = this.parseOwnerAndRepo(this.statisticFilterForm.get('githubRepoURL').value);
          this.getAllPullRequests();
          this.getCollaborators();
        } else {
          this.resetFormAndData();
        }
      });
  }

  private parseOwnerAndRepo(githubRepoURL?: string): string {
    return githubRepoURL.substring(19, githubRepoURL.length);
  }

  private listenForRoute() {
    this.activatedRoute.queryParams.subscribe(params => {
      if ('page' in params) {
        this.page = params.page;
      }
    });
  }

  private getCollaborators() {
    if (this.isLoadingCollaborators) {
      return;
    }
    this.statisticFilterForm.get('githubRepoURL').disable();
    this.errorMessage = undefined;
    this.isLoadingCollaborators = true;
    this.errorMessageCollaborator = '';
    this.githubApiService.getRepoCollaborators(this.ownerAndRepo)
      .pipe(
        map(collaborators => {
          return collaborators.map(collaborator => {
            collaborator.selected = false;
            return collaborator;
          });
        }),
        finalize(() => {
          this.isLoadingCollaborators = false;
          this.statisticFilterForm.get('githubRepoURL').enable();
        })
      )
      .subscribe(
        collaborators => {
          this.genCollaboratorsFormArray(collaborators);
        },
        (err: HttpErrorResponse) => {
          this.errorMessageCollaborator = err.error.message;
        }
      );
  }

  private filterPullRequests() {
    this.filterPullRequestsBySelectedCollaborators();
  }
  
  doesPullRequestBelongToDateRange(pull): boolean {
    const { startDate, endDate } = this.statisticFilterForm.value;
    const startDateStr = moment(startDate.year + '-' + startDate.month + '-' + startDate.day + ' 00:00:00', 'YYYY-M-D HH:mm:ss');
    const endDateStr = moment(endDate.year + '-' + endDate.month + '-' + endDate.day + ' 23:59:59', 'YYYY-M-D HH:mm:ss');
    return moment(pull.merged_at).isBetween(startDateStr, endDateStr);
  }

  private genForm() {
    this.statisticFilterForm = this.formBuilder.group({
      githubRepoURL: '',
      startDate: this.mondayOfWeek(moment()),
      endDate: this.sundayOfWeek(moment()),
      collaborators: this.formBuilder.array([])
    });
  }

  private genCollaboratorsFormArray(collaborators: any[]) {
    this.clearCollaboratorsFormArray();
    collaborators.forEach(collaborator => {
      const collaboratorFormGroup: FormGroup = this.formBuilder.group({
        avatar: collaborator.avatar_url,
        login: collaborator.login,
        selected: false
      });
      this.collaboratorsFormArray.push(collaboratorFormGroup);
    });
  }

  private clearCollaboratorsFormArray() {
    while (this.collaboratorsFormArray.controls.length !== 0) {
      this.collaboratorsFormArray.removeAt(0);
    }
  }

  private resetFormAndData() {
    this.statisticFilterForm.reset({
      githubRepoURL: '',
      startDate: this.mondayOfWeek(moment()),
      endDate: this.sundayOfWeek(moment()),
      collaborators: this.formBuilder.array([])
    });

    this.clearCollaboratorsFormArray();

    this.pullRequests = undefined;
    this.filteredByUserPullRequests = undefined;
    this.errorMessage = undefined;
  }

  selectAndCopyData() {
    document.getElementById('header-data-table').style.display = "none";
    const elementToSelect = document.getElementById('data-table');
    const range = document.createRange();
    const selection = window.getSelection();
    selection.removeAllRanges();
    range.selectNode(elementToSelect);
    selection.addRange(range);
    document.execCommand('Copy');
    this.isShowNotiCopyData = true;
    setTimeout(() => {
      document.getElementById('header-data-table').style.display = "";
      selection.removeAllRanges();
      this.isShowNotiCopyData = false;
    }, 1000);
  }
}
