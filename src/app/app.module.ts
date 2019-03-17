import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { LayoutModule } from './shared/layout/layout.module';
import { AuthInterceptorService } from './shared/services/auth-interceptor.service';

const interceptors = [
  {
    provide: HTTP_INTERCEPTORS,
    useClass: AuthInterceptorService,
    multi: true
  }
];

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    LayoutModule
  ],
  providers: [
    ...interceptors
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule {
}
