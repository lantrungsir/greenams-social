import { Component, OnInit } from '@angular/core';
import {UserService} from "../user.service"
import { AuthHttp } from 'angular2-jwt';
@Component({
  selector: 'app-messenger',
  templateUrl: './messenger.component.html',
  styleUrls: ['./messenger.component.scss']
})
export class MessengerComponent implements OnInit {
  currentUser : any
  users: any
  userKeys : any
  constructor(private userService : UserService, private http :AuthHttp) {
    this.userService.getCurrentUser().then((user)=>{
      this.currentUser = user
      Object.defineProperty(this.currentUser, "id", {
        value : localStorage.getItem('id');
        writable: true,
        configurable: true
      })
    })
    this.http.get("api/users").toPromise().then((res)=>{
      this.users = res.json();
      this.userKeys = Object.keys(this.users);
    })
   }

  ngOnInit() {
  }

}
