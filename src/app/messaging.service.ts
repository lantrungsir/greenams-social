import { Injectable } from '@angular/core';
import * as firebase from "firebase"
import { AuthHttp } from 'angular2-jwt';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'firebase/messaging';
@Injectable()
export class MessagingService {
  currentMessage = new BehaviorSubject(null);
  constructor(private http: AuthHttp) {
   }
  getPermission(){
    firebase.messaging().requestPermission()
    .then(() => {
      console.log('Notification permission granted.');
      return firebase.messaging().getToken()
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
    firebase.messaging().onMessage((payload)=>{
      this.currentMessage.next(payload);
    })
  }
}
