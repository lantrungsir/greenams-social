import { Injectable } from '@angular/core';
import { AuthHttp } from 'angular2-jwt';
declare const firebase:any
@Injectable()
export class MessagingService {
  messaging
  constructor(private http: AuthHttp) {
    firebase.initializeApp({
      apiKey: "AIzaSyBN5ZiNdP6gnGqT5zFu61Tm7WUImMpFXHo",
      authDomain: "free-schedule.firebaseapp.com",
      databaseURL: "https://free-schedule.firebaseio.com",
      projectId: "free-schedule",
      storageBucket: "free-schedule.appspot.com",
      messagingSenderId: "410685537662"
    })
    this.messaging = firebase.messaging()
   }
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
    this.http.post("api/users/fcm-token?id="+localStorage.getItem('id'),{
      token : token
    }).toPromise()
    .then((res)=>{
      console.log("awesome")
    })
  }
}
