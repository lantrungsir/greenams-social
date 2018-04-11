import { Component, OnInit } from '@angular/core';
import {UserService} from "../user.service"
import { AuthHttp } from 'angular2-jwt';
import { UpdateService } from '../update.service';
import * as $ from "jquery"
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
  selectedChatroom : any = null;
  groups: any;
  groupKeys: any
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
    this.http.get("api/messages/groups").toPromise().then((res)=>{
      this.groups = res.json();
      
      this.groupKeys = Object.keys(this.groups)
    })
    this.http.get("api/messages/groups?id=main").toPromise().then((res)=>{
      var data = res.json()
      this.selectedChatroom = {
        "type": "group",
        "name": data.name,
        "id": "main",
        picture : data.picture,
        'messages': data['messages']
      }
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

    //des resizable window :
    if($(window).width() <= 400){
      $(".chat").hide();
    }
    $(window).resize(()=>{
      var w = $(window).width();
      if($(window).width() <= 400){
        $(".chat").hide();
        $("#people-list").show();
        $("#people-list").width(w)
      }
      else{
        $("#people-list").show()
        $("#people-list").width("33%");
        $(".chat").width('67%')
        $(".chat").show();
      }
    })
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
    if($(window).width() <= 400){
      $('#people-list').hide();
      $('.chat').width($(window).width())
      $('.chat').show();
    }
  }

}
