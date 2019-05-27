import { Component, OnInit } from '@angular/core';
import { GithubApiService } from '../shared/services/github-api.service';
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
  filteredPullRequests: any[];
  isLoadingCollaborators = false;
  isLoadingPullRequests = false;
  statisticFilterForm: FormGroup;
  errorMessagePullRequests: string;
  errorMessageCollaborators: string;
  copyingData = false;
  private ownerAndRepo: string;

  constructor(private githubApiService: GithubApiService,
              private formBuilder: FormBuilder) {
  }

  ngOnInit() {
    this.genForm();
    this.listenForRepoUrlChange();
  }

  handleDateChange() {
    this.getAllPullRequests();
  }

  handleCollaboratorCheckboxChecked() {
    this.getAllPullRequests();
  }

  get collaborators(): FormArray {
    return this.statisticFilterForm.get('collaborators') as FormArray;
  }

  navigateWeek(direction: string) {
    const { startDate, endDate } = this.statisticFilterForm.value;
    let startDateMoment: Moment;
    let endDateMoment: Moment;
    const timeFormat = 'YYYY-M-D HH:mm:ss';
    const startTimeStr = startDate.year + '-' + startDate.month + '-' + startDate.day + ' 00:00:00';
    const endTimeStr = endDate.year + '-' + endDate.month + '-' + endDate.day + ' 00:00:00';

    if (direction === 'next') {
      startDateMoment = moment(startTimeStr, timeFormat).add(7, 'day');
      endDateMoment = moment(endTimeStr, timeFormat).add(7, 'day');
    } else if (direction === 'prev') {
      startDateMoment = moment(startTimeStr, timeFormat).subtract(7, 'day');
      endDateMoment = moment(endTimeStr, timeFormat).subtract(7, 'day');
    }

    this.statisticFilterForm.patchValue({
      startDate: this.genDatePickerDate(startDateMoment),
      endDate: this.genDatePickerDate(endDateMoment)
    });

    this.getAllPullRequests();
  }

  selectAndCopyData() {
    const elementToSelect = document.getElementById('data-table');
    const range = document.createRange();
    const selection = window.getSelection();
    selection.removeAllRanges();
    range.selectNode(elementToSelect);
    selection.addRange(range);
    document.execCommand('Copy');
    this.copyingData = true;
    setTimeout(() => {
      selection.removeAllRanges();
      this.copyingData = false;
    }, 1000);
  }

  private genDatePickerDate(momentDay): NgbDateStruct {
    const year = momentDay.year();
    const month = momentDay.month() + 1;
    const day = momentDay.date();
    return { year, month, day };
  }

  private get defaultStartOfWeek(): NgbDateStruct {
    const mondayMoment: Moment = moment().subtract(1, 'weeks').isoWeekday(6);
    const year = mondayMoment.year();
    const month = mondayMoment.month() + 1;
    const day = mondayMoment.date();
    return { year, month, day };
  }

  private get defaultEndOfWeek(): NgbDateStruct {
    const sundayMoment: Moment = moment().isoWeekday(5);
    const year = sundayMoment.year();
    const month = sundayMoment.month() + 1;
    const day = sundayMoment.date();
    return { year, month, day };
  }

  private listenForRepoUrlChange() {
    this.statisticFilterForm
      .get('githubRepoURL')
      .valueChanges
      .pipe(distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)))
      .subscribe((githubRepoURL: string) => {
        if (githubRepoURL) {
          this.ownerAndRepo = this.statisticFilterForm.get('githubRepoURL').value.substring(19, githubRepoURL.length);
          this.getAllPullRequests();
          this.getCollaborators();
        } else {
          this.resetFormAndData();
        }
      });
  }

  private getAllPullRequests() {
    if (this.isLoadingPullRequests) {
      return;
    }
    this.errorMessagePullRequests = undefined;
    this.isLoadingPullRequests = true;
    this.githubApiService.getRepoPullRequests(this.ownerAndRepo)
      .pipe(
        map(
          pulls => pulls.filter(pull => {
            return this.doesPullRequestBelongToSelectedCollaborators(pull)
              && this.doesPullRequestBelongToDateRange(pull);
          })
        ),
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
        this.filteredPullRequests = pulls.reverse();
      },
      (err: HttpErrorResponse) => {
        this.errorMessagePullRequests = err.error.message;
      }
    );
  }

  private getCollaborators() {
    if (this.isLoadingCollaborators) {
      return;
    }
    this.statisticFilterForm.get('githubRepoURL').disable();
    this.errorMessagePullRequests = undefined;
    this.isLoadingCollaborators = true;
    this.errorMessageCollaborators = '';
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
          this.errorMessageCollaborators = err.error.message;
        }
      );
  }

  private doesPullRequestBelongToDateRange(pull): boolean {
    const { startDate, endDate } = this.statisticFilterForm.value;
    const startDateStr = moment(startDate.year + '-' + startDate.month + '-' + startDate.day + ' 00:00:00', 'YYYY-M-D HH:mm:ss');
    const endDateStr = moment(endDate.year + '-' + endDate.month + '-' + endDate.day + ' 23:59:59', 'YYYY-M-D HH:mm:ss');
    return moment(pull.merged_at).isBetween(startDateStr, endDateStr);
  }

  private doesPullRequestBelongToSelectedCollaborators(pull): boolean {
    const selectedCollaborators: string[] = this.collaborators.value
      .filter(col => col.selected)
      .reduce((accumulator, collaborator) => {
        accumulator.push(collaborator.login);
        return accumulator;
      }, []);
    if (selectedCollaborators && selectedCollaborators.length) {
      return selectedCollaborators.indexOf(pull.user.login) > -1;
    } else {
      return true;
    }
  }

  private genForm() {
    this.statisticFilterForm = this.formBuilder.group({
      githubRepoURL: 'https://github.com/framgia/sun-startup-studio',
      startDate: this.defaultStartOfWeek,
      endDate: this.defaultEndOfWeek,
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
      this.collaborators.push(collaboratorFormGroup);
    });
  }

  private clearCollaboratorsFormArray() {
    while (this.collaborators.controls.length !== 0) {
      this.collaborators.removeAt(0);
    }
  }

  private resetFormAndData() {
    this.statisticFilterForm.reset({
      githubRepoURL: '',
      startDate: this.defaultStartOfWeek,
      endDate: this.defaultEndOfWeek,
      collaborators: this.formBuilder.array([])
    });

    this.clearCollaboratorsFormArray();

    this.filteredPullRequests = undefined;
    this.errorMessagePullRequests = undefined;
  }
}
