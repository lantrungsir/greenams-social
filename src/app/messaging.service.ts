import { Injectable } from '@angular/core';
import * as firebase from "firebase"
import { AuthHttp } from 'angular2-jwt';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
@Injectable()
export class MessagingService {
  messaging = firebase.messaging();
  currentMessage = new BehaviorSubject(null);
  constructor(private http: AuthHttp) { }
  getPermission(){
    this.messaging.requestPermission()
    .then(() => {
      console.log('Notification permission granted.');
      return this.messaging.getToken()
    })
    .then(token => {
      console.log(token)
      this.updateToken(token)
    })
    .catch((err) => {
      console.log('Unable to get permission to notify.', err);
    });
  }
  updateToken(token){
    this.http.post("api/users/fcm-token",{
      token : token
    }).toPromise()
    .then((res)=>{
      console.log("awesome")
    })
  }
  receiveMessage(){
    this.messaging.onMessage((payload)=>{
      this.currentMessage.next(payload);
    })
  }
}
