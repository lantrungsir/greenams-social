import { Injectable } from '@angular/core';
import { AuthHttp } from "angular2-jwt"
import {RequestOptions} from "@angular/http"
import { Router } from '@angular/router';
declare const FB: any
@Injectable()
export class UserService {

  constructor(private http : AuthHttp, private router : Router) {
    FB.init({
      appId      : '790223617837082',
      status     : false, // the SDK will attempt to get info about the current user immediately after init
      cookie     : false,  // enable cookies to allow the server to access
      // the session
      xfbml      : false,  // With xfbml set to true, the SDK will parse your page's DOM to find and initialize any social plugins that have been added using XFBML
      version    : 'v2.12' // use graph api version 2.5
    })
  }
  fbLogin(){
    return new Promise((resolve, reject) => {
      FB.login(result => {
        if (result.authResponse.userID) {
          return this.http.post(`auth/facebook`, {user_token: result.authResponse.accessToken})
              .toPromise()
              .then(response => {
                var token = response.headers.get('x-auth-token');
                if (token) {
                  localStorage.setItem('auth_token', token);
                }
                resolve(response.json());
              })
              .catch(() => reject());
        } else {
          reject();
        }
      }, {scope: 'public_profile'})
    });
  }
  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('id')
  }

  isLoggedIn(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.getCurrentUser().then(user => {if(user === null){this.router.navigate(["/login"]);reject(false)}else{resolve(true)}}).catch(() => {this.router.navigate(["/login"]);reject(false)});
    });
  }

  getCurrentUser() {
    return new Promise((resolve, reject) => {
      return this.http.get(`/auth/me?id=`+localStorage.getItem('id'))
      .toPromise().then(response => {
        console.log(response);
        resolve(response.json());
      }).catch(() => reject());
    });
  }
  isNotLoggedIn(): Promise<boolean>{
    return new Promise((resolve, reject) => {
      this.getCurrentUser().then(user => {
        if(user === null){
          resolve(true)
        }
        else{
          this.router.navigate(['/dashboard']);
          reject(false);
        }
      }
      ).catch(() => resolve(true));
    });
  }
}

