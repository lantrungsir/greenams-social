import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {UserService} from "./user.service"

import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import {FormsModule} from "@angular/forms"
import {Http} from "@angular/http"
import {AuthHttp, AuthConfig} from "angular2-jwt"
import { AppRouteModule } from './app.route/app.route.module';
import { HttpModule } from '@angular/http';
import { DashboardComponent } from './dashboard/dashboard.component';
import { GrouppostComponent } from './grouppost/grouppost.component';

import { UpdateService } from './update.service';
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
    GrouppostComponent
  ],
  imports: [
    BrowserModule,
    AppRouteModule,
    HttpModule,
    FormsModule
  ],
  providers: [UserService,
    {
      provide: AuthHttp,
      useFactory: getAuthHttp,
      deps: [Http]
    },
    UpdateService 
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
