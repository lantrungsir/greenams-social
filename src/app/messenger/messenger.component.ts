import { Component, OnInit } from '@angular/core';
import {UserService} from "../user.service"
import { AuthHttp } from 'angular2-jwt';
import { UpdateService } from '../update.service';
@Component({
  selector: 'app-messenger',
  templateUrl: './messenger.component.html',
  styleUrls: ['./messenger.component.scss']
})
export class MessengerComponent implements OnInit {
  currentUser : any
  users: any
  userKeys : any
  socket: any
  constructor(private userService : UserService, private http :AuthHttp, private ioService : UpdateService) {
    this.userService.getCurrentUser().then((user)=>{
      this.currentUser = user
      Object.defineProperty(this.currentUser, "id", {
        value : localStorage.getItem('id'),
        writable: true,
        configurable: true
      })
    })
    this.http.get("api/users").toPromise().then((res)=>{
      this.users = res.json();
      this.userKeys = Object.keys(this.users);
    })
    this.socket = this.ioService.socket
   }

  ngOnInit() {
    this.socket.on("online", function(user){
      this.userKeys.push(user.id);
      Object.defineProperty(this.users, user.id, {
        value : user.data,
        configurable: true,
        writable: true
      })
    })
  }

}
