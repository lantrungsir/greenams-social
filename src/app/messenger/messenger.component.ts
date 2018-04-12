import { Component, OnInit } from '@angular/core';
import {UserService} from "../user.service"
import { AuthHttp } from 'angular2-jwt';
import { UpdateService } from '../update.service';
import {Input} from "@angular/core"
import * as $ from "jquery"
@Component({
  selector: 'app-messenger',
  templateUrl: './messenger.component.html',
  styleUrls: ['./messenger.component.css']
})
export class MessengerComponent implements OnInit {
  @Input() currentUser : any
  users: any
  userKeys : any
  socket: any
  selectedChatroom : any = null;
  groups: any;
  groupKeys: any
  constructor(private http :AuthHttp, private ioService : UpdateService) {
    
    this.http.get("api/users").toPromise().then((res)=>{
      this.users = res.json();
      this.userKeys = Object.keys(this.users);
    })
    this.http.get("api/messages/groups").toPromise().then((res)=>{
      this.groups = res.json();
      
      this.groupKeys = Object.keys(this.groups)
    })
    this.socket = this.ioService.socket;
    this.socket.emit("post-on", {
      uid : localStorage.getItem('id')
    })
   }

  ngOnInit() {
    this.socket.on("online", (user)=>{
      Object.defineProperty(this.users, user.id, {
        value : user.data,
        configurable: true,
        writable: true
      })
      if(this.userKeys.indexOf(user.id) === -1){
        this.userKeys.push(user.id)
      }
    })
    this.socket.on("offline", (data)=>{
      Object.defineProperty(this.users[data.id], "realtime", {
        value : "offline",
        configurable: true,
        writable: true
      })
    })
    	
  }
  openChat(){
      $('.main-section').toggleClass("open-more");
  }
  chooseChatRoom(key: string, type: string){
    if(type === "admin"){

    }
    if(type === "group"){
      this.http.get("api/messages/groups?id="+key).toPromise()
        .then((res)=>{
          var data = res.json()
          this.selectedChatroom = {
            "type": "group",
            "id": "key",
            "name" : data.name,
            "picture" : data.picture,
            "messages": data['messages']
          }
        })
    }
    if(type === "personal"){
      this.http.get("api/messages/individual?from="+this.currentUser.id+ "&to=" +key).toPromise()
      .then((res)=>{
        this.selectedChatroom = {
          "type" :"individual",
          "to" : key,
          "picture" : this.users[key].profile_pic,
          "name" : this.users[key].name,
          "messages" : res.json()
        }
      })
    }
  }

}
