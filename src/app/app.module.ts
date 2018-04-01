import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {UserService} from "./user.service"
import {UpcomingToLatestPipe} from "./pipes/app.sortbydate.pipes"

import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import {Http} from "@angular/http"
import {AuthHttp, AuthConfig} from "angular2-jwt"
import { AppRouteModule } from './app.route/app.route.module';
import { HttpModule } from '@angular/http';
import { DashboardComponent } from './dashboard/dashboard.component';
import { GrouppostComponent } from './grouppost/grouppost.component';
export function getAuthHttp(http: Http) {
  return new AuthHttp(new AuthConfig({
    headerName: 'x-auth-token',
    noTokenScheme: true,
    noJwtError: true,
    globalHeaders: [{'Accept': 'application/json'}],
    tokenGetter: (() => localStorage.getItem('auth_token')),
  }), http);
}

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent,
    GrouppostComponent,
    UpcomingToLatestPipe
  ],
  imports: [
    BrowserModule,
    AppRouteModule,
    HttpModule
  ],
  providers: [UserService,
    {
      provide: AuthHttp,
      useFactory: getAuthHttp,
      deps: [Http]
    } 
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
