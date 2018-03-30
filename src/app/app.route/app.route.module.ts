import { NgModule } from '@angular/core';
import {RouterModule, Routes} from "@angular/router";
import {LoginComponent} from  "../login/login.component";
import { AuthGuard } from '../auth.guard';
const appRoute : Routes = [
  {
    path: '/login',
    component : LoginComponent,
    canActivate: [AuthGuard]
  }
]
@NgModule({
  imports: [
    RouterModule.forRoot(appRoute)
  ],
  declarations: [],
  providers: [
    AuthGuard
  ]
})
export class AppRouteModule { }
