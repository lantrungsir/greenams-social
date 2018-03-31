import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import {UserService} from './user.service'
import { Router } from '@angular/router';
@Injectable()
export class AnonymousGuard implements CanActivate {
  constructor(private router :Router, private userService : UserService){}
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
      return true;
  }
  checkLogin(): Promise<boolean> {
    return this.userService.isNotLoggedIn();
}
}
