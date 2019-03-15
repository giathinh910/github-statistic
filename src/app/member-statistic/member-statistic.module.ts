import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MemberStatisticComponent } from './member-statistic.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    component: MemberStatisticComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  declarations: [
    MemberStatisticComponent
  ]
})
export class MemberStatisticModule {
}
