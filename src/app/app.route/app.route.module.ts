import { NgModule } from '@angular/core';
import {RouterModule, Routes} from "@angular/router";
import {LoginComponent} from  "../login/login.component";
import { AuthGuard } from '../auth.guard';
import { AnonymousGuard } from '../anonymous.guard';
import { DashboardComponent } from '../dashboard/dashboard.component';
const appRoute : Routes = [
  {
    path: 'login',
    component : LoginComponent,
    canActivate: [AnonymousGuard]
  },
  {path: 'dashboard', component:DashboardComponent, canActivate : [AuthGuard]},
  {path: '', redirectTo: "login", pathMatch :"full"},
]
@NgModule({
  imports: [
    RouterModule.forRoot(appRoute)
  ],
  declarations: [],
  providers: [
    AuthGuard,
    AnonymousGuard
  ],
  exports:[
    RouterModule
  ]
})
export class AppRouteModule { }
