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
  @Input() currentUser : any;
  @Input() currentId : any;
  users: any
  userKeys : any
  socket: any
  selectedChatroom : any = null;
  groups: any;
  groupKeys: any;
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
  ngAfterViewInit(){    
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
          this.renderChatroom(key)
        })
    }
    if(type === "personal"){
      this.http.get("api/messages/individual?from="+localStorage.getItem('id')+ "&to=" +key).toPromise()
      .then((res)=>{
        this.selectedChatroom = {
          "type" :"individual",
          "to" : key,
          "picture" : this.users[key].profile_pic,
          "name" : this.users[key].name,
          "messages" : res.json()
        }
        this.renderChatroom(key)
      })
    }
  }
  renderChatroom(key: string){
    var childOffset = $("#"+ key).offset();
    var parentOffset = $("#"+ key).parent().parent().offset();
    var childTop = childOffset.top - parentOffset.top;
    var clone = $("#"+ key).find('img').eq(0).clone();
    var top = childTop+12+"px";
    
    $(clone).css({'top': top}).addClass("floatingImg").appendTo("#chatbox");									
    
    setTimeout(function(){$("#profile p").addClass("animate");$("#profile").addClass("animate");}, 100);
    setTimeout(function(){
      $("#chat-messages").addClass("animate");
      $('.cx, .cy').addClass('s1');
      setTimeout(function(){$('.cx, .cy').addClass('s2');}, 100);
      setTimeout(function(){$('.cx, .cy').addClass('s3');}, 200);			
    }, 150);														
    
    $('.floatingImg').animate({
      'width': "68px",
      'left':'108px',
      'top':'20px'
    }, 200);
    
    var name = $("#"+key).find("p strong").html();
    var email = $("#"+key).find("p span").html();														
    $("#profile p").html(name);
    $("#profile span").html(email);												
    $('#friendslist').fadeOut();
    $('#chatview').fadeIn();
  
    
    $('#close').unbind("click").click(function(){				
      $("#chat-messages, #profile, #profile p").removeClass("animate");
      $('.cx, .cy').removeClass("s1 s2 s3");
      $('.floatingImg').animate({
        'width': "40px",
        'top':top,
        'left': '12px'
      }, 200, function(){$('.floatingImg').remove()});				
      
      setTimeout(function(){
        $('#chatview').fadeOut();
        $('#friendslist').fadeIn();				
      }, 50);
    });
  }
}
