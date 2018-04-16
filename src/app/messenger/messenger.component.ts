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
  selectedChatroom : any ={};
  groups: any;
  groupKeys: any;
  filesToUpload : File[] =  []
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
  	this.socket.on("new-message", (data)=>{
      if(this.selectedChatroom.type === data.type && data.type === "individual"){
        if(this.selectedChatroom.to === data.sender){
          if(this.currentId === data.recipient){
            this.selectedChatroom.messages.push({
              "author" : data.sender,
              "data" : {
                "text" : data.message.text
              }
            })
          }
        }
      }
      if(this.selectedChatroom.type === data.type && data.type === "groups"){
        if(this.selectedChatroom.to === data.recipient){
          if(data.recipient === "main" || this.groups[data.recipient].members[this.currentId]=== true){
            this.selectedChatroom.messages.push({
              "author" : data.sender,
              "data" : {
                "text" : data.message.text
              }
            })
          }
        }
      }
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
          var data = res.json();
          var messages = data['messages']
          this.selectedChatroom = {
            "type": "groups",
            "to": key,
            "messages": messages
          }
          this.renderChatroom(key)
        })
    }
    if(type === "personal"){
      this.http.get("api/messages/individual?from="+localStorage.getItem('id')+ "&to=" +key).toPromise()
      .then((res)=>{
        var messages = res.json();
        this.selectedChatroom = {
          "type" :"individual",
          "to" : key,
          "messages" : messages
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

  sendMessage(type: string, recipient : string){
    //send the message
      this.makesFileRequest().then((result)=>{
        var data = {
          text : $("#sendmessage textarea").val(),
          images : result.images,
          links: result.links
        }
        $("#sendmessage textarea").val("")
        this.socket.emit("new-message", {
          'type' : type,
          'sender' : this.currentId,
          'recipient' : recipient,
          'message' : data
        })
        this.selectedChatroom.messages.push({
          "author" : this.currentId,
          "data" : {
            "text" : data.text
          }
        })
      })
  }

  filesChangeEvent(fileInput : any){
    this.filesToUpload = <Array<File>>fileInput.target.files;
  }
  makesFileRequest(){
    return new Promise<any>((resolve, reject)=>{
      var formData = new FormData();
      for(var i =0 ;i< this.filesToUpload.length; i++){
        formData.append("upload", this.filesToUpload[i], this.filesToUpload[i].name);
      }
      if(this.filesToUpload.length >0){
        var type = this.selectedChatroom.type;
        this.http.post(
            "api/messages/upload?type="+ type +"&from="+this.currentId+"&to="+ this.selectedChatroom.to+ "&mid="+this.selectedChatroom.messages.length, 
            formData).toPromise().then((res)=>{
              resolve(res.json())
          })
      }
      else{
        resolve({
          "images":[],
          "links": []
        })
      }
    })
  }
}
