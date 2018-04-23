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
      this.userKeys = Object.keys(this.users)
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
      $("#chat-messages").animate({
        scrollTop: $('#chat-messages').get(0).scrollHeight
      }, 500)
    })
    this.socket.on("update-message", (data)=>{
      if(this.selectedChatroom.type === data.type && data.type === "individual"){
        if(this.selectedChatroom.to === data.from){
          if(this.currentId === data.to){
            this.selectedChatroom.messages[parseInt(data.id)] = {
              "author" : data.from,
              "data" : data.data
            }
          }
        }
      }
      if(this.selectedChatroom.type === data.type && data.type === "groups"){
        if(this.selectedChatroom.to === data.from){
          if(data.to === "main" || this.groups[data.to].members[this.currentId]=== true){
            this.selectedChatroom.messages[parseInt(data.id)] = {
              "author" : data.from,
              "data" : data.data
            }
          }
        }
      }
      $("#chat-messages").animate({
        scrollTop: $('#chat-messages').get(0).scrollHeight
      }, 500)
    })
  }
  ngAfterViewInit(){

  }

  chooseChatRoom(key: string, type: string){
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
    var data = {
      text : ""
    }
    var text =   $("#sendmessage textarea").val();
	  var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
	  var text1= text.replace(exp, "<a href='$1'>$1</a>");
    var exp2 =/(^|[^\/])(www\.[\S]+(\b|$))/gim;
    console.log("convert!!")
    data.text = text1.replace(exp2, '$1<a target="_blank" href="http://$2">$2</a>');
    this.socket.emit("new-message", {
      'type' : type,
      'sender' : this.currentId,
      'recipient' : recipient,
      'message' : data
    })
    this.makesFileRequest(this.selectedChatroom.messages.length).then((result)=>{

        this.selectedChatroom.messages.push({
          "author" : this.currentId,
          "data": {
            text: data.text,
            images:  result.images,
            links: result.links
          }
        })
        $("#chat-messages").animate({
          scrollTop: $('#chat-messages').get(0).scrollHeight
        }, 500)
        this.socket.emit("update-message", {
          "type" : this.selectedChatroom.type,
          "from": this.currentId,
          "to" : this.selectedChatroom.to,
          "id" : this.selectedChatroom.messages.length-1,
          "data" : {
            text : data.text,
            images: result.images,
            links: result.links
          }
        })
        $("#sendmessage textarea").val("");
      })
  }

  filesChangeEvent(fileInput : any){
    this.filesToUpload = <Array<File>>fileInput.target.files;
  }
  makesFileRequest(id: number){
    return new Promise<any>((resolve, reject)=>{
      var formData = new FormData();
      for(var i =0 ;i< this.filesToUpload.length; i++){
        formData.append("upload", this.filesToUpload[i], this.filesToUpload[i].name);
      }
      if(this.filesToUpload.length >0){
        var type = this.selectedChatroom.type;
        this.filesToUpload = [];
        this.http.post(
            "api/messages/upload?type="+ type +"&from="+this.currentId+"&to="+ this.selectedChatroom.to+ "&mid="+id, 
            formData).toPromise().then((res)=>{
              resolve(res.json())
          })
      }
      else{
        resolve({
          images:[],
          links: []
        })
      }
    })
  }
}
