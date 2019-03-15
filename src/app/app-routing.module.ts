import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuardService } from './shared/services/auth-guard.service';
import { LoginGuardService } from './shared/services/login-guard.service';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'member-statistic',
    pathMatch: 'full'
  },
  {
    path: 'authenticate',
    loadChildren: './auth/auth.module#AuthModule',
    canActivate: [LoginGuardService]
  },
  {
    path: 'member-statistic',
    loadChildren: './member-statistic/member-statistic.module#MemberStatisticModule',
    canActivate: [AuthGuardService]
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule {
}
