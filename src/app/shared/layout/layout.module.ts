import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TopNavComponent } from './top-nav/top-nav.component';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    CommonModule,
    RouterModule
  ],
  declarations: [
    TopNavComponent
  ],
  exports: [
    TopNavComponent
  ]
})
export class LayoutModule {
}
