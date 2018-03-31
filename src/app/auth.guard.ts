import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot,Router } from '@angular/router';
import {UserService} from './user.service'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private userService: UserService, private router : Router){}
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
      var check : boolean;
        this.userService.isLoggedIn().then(()=>{
          check = true;
        }).catch(()=>{
          check = false;
        })
      return check;
  }
}
