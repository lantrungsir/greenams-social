import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot,Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import {UserService} from './user.service'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private userService: UserService, private router : Router){}
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        return this.checkLogin();
  }
  checkLogin():Promise<boolean>{
    return new Promise((resolve,reject)=>{
        this.userService.isLoggedIn().then(()=>{
          resolve(true);
        })
        this.router.navigate(["/login"]);
        reject(false);
    })
  }
}
