import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MemberStatisticComponent } from './member-statistic.component';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';

const routes: Routes = [
  {
    path: '',
    component: MemberStatisticComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    NgbDatepickerModule
  ],
  declarations: [
    MemberStatisticComponent
  ]
})
export class MemberStatisticModule {
}
