import { Component, OnInit } from '@angular/core';
import { UserService } from '../user.service';
import { Router } from '@angular/router';
import { AuthHttp } from 'angular2-jwt';
import { ViewChild } from '@angular/core';
import * as $ from "jquery"
import { UpdateService } from '../update.service';
import {MessagingService} from '../messaging.service'
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  private Notifications :any[] = []
  private FilesToUpload: File[] = []
  private currentMessage = null;
  @ViewChild("navDemo") nav ;
  private socket;
  CurrentUser : any
  posts = [];
  id : string;
  users: any = {}
  events : any =[]
  constructor(private userService : UserService, private router: Router, private http :AuthHttp, private ioService : UpdateService, private msgService : MessagingService) {
    this.id = localStorage.getItem('id')
    this.msgService.getPermission();
    this.getEvent()
    this.userService.getCurrentUser().then((user)=>{
      this.CurrentUser = user
      this.http.get("api/users").toPromise().then((res)=>{
        this.users = res.json();
        this.getPost()
        .then((postsData)=>{
          this.posts = postsData;
          for(var i = 0;i < this.posts.length ;i++){
            Object.defineProperty(this.posts[i], "id", {
              value : i+1,
              configurable: true
            })
          }
        })
      })
    }).catch(()=>{
      this.userService.logout();
      this.router.navigate(["/login"])
    })

    this.socket = this.ioService.socket;
    this.socket.emit("post-on", {uid : localStorage.getItem('id')})
    this.socket.on("online", function(data){
      //add to array

    })
    this.socket.on("new-post",(data)=>{
      data.post.likes = [];
      data.post.comments = [];
      this.addPost(data.post)
    })
    this.socket.on("online", (user)=>{
      Object.defineProperty(this.users, user.id, {
        value : user.data,
        configurable: true,
        writable: true
      })
    })
   }

  ngOnInit() {
    $("#myModal").hide();
    $(".close").click(()=>{
      $("#myModal").hide();
    })
    this.msgService.messaging.onMessage((payload)=>{
      console.log(payload);
      this.Notifications.splice(0,0, payload);
      if(payload.data.isEvent === true){
        this.events.splice(0,0, payload.data.content)
      }
    })
  }

  getEvent(){
    this.http.get("api/events").toPromise().then((res)=>{
      this.events = res.json();
      for(var i = 0; i<this.events.length ;i++){
        var time = this.events[i].time
        var date =this.events[i].day
        this.events[i].time = new Date(time).toLocaleTimeString();
        this.events[i].day = new Date(date).toLocaleDateString();
      }
    })
  }
  getPost(): Promise<any>{
   return new Promise((resolve, reject)=>{
        this.http.get("api/posts").toPromise().then((res)=>{
          resolve(res.json())
        }).catch(()=>{reject()});
   })
  }
  addPost(post){
    var newPost= post
    Object.defineProperty(newPost, "id", {
      value : 1,
      configurable: true
    })
    console.log("good "+0);
    for(var i = 0;i < this.posts.length ;i++){
      Object.defineProperty(this.posts[i], "id", {
        value : i+2,
        configurable: true
      })
      console.log(this.posts[i].id)
    }
    this.posts.splice(0,0, post);
  }
  openNav(){
    var x = this.nav.nativeElement;
    if (x.className.indexOf("w3-show") == -1) {
        x.className += " w3-show";
    } else { 
        x.className = x.className.replace(" w3-show", "");
    }
  }

  setNewPost(){
    var newPost ={
      "author" : this.id,
      "message" : "",
      "time" :"",
      links :[],
    }
    var text =   $("#newpost").text();
	  var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
	  var text1=text.replace(exp, "<a href='$1'>$1</a>");
    var exp2 =/(^|[^\/])(www\.[\S]+(\b|$))/gim;
    newPost.message = text1.replace(exp2, '$1<a target="_blank" href="http://$2">$2</a>');
      Object.defineProperty(newPost, "time", {
        value : new Date().toLocaleDateString(),
        configurable: true
      })
      $("#newpost").text("")
      this.http.post("api/posts", {
        new_post : newPost
      }).toPromise().then((res)=>{
        console.log(res.text());
        if(this.FilesToUpload.length !== 0){
          this.makeFileRequest().then((data)=>{
           newPost.links = newPost.links.concat(data.links);
            Object.defineProperty(newPost, "images", {
              value: data.images,
              configurable: true
            })
            this.addPost(newPost)
            this.socket.emit("new-post", {post: newPost})
            Object.defineProperty(newPost,"likes", {
              value: [],
              configurable: true
            })
            Object.defineProperty(newPost, "comments", {
              value: [],
              configurable: true
            })
            return;
          })
        }
        else{
          Object.defineProperty(newPost,"likes", {
            value: [],
            configurable: true
          })
          Object.defineProperty(newPost, "comments", {
            value: [],
            configurable: true
          })
          this.addPost(newPost)
          this.socket.emit("new-post", {post: newPost})
        }
      })
  
  }

  fileChangeEvent(fileInput: any){
    this.FilesToUpload = <Array<File>> fileInput.target.files;
  }

  makeFileRequest(){
    var formData = new FormData();
    for(var i =0 ;i< this.FilesToUpload.length; i++){
      formData.append("uploads", this.FilesToUpload[i], this.FilesToUpload[i].name);
    }
    return new Promise<any>((resolve, reject)=>{
      var num =this.posts.length+1
      this.http.post("api/upload?post_id="+num, formData).toPromise().then((res)=>{
        this.FilesToUpload = null;
        var id = res.json().id;
        var post =res.json().data;
        resolve(post);
      });
    })
  }

  navigateChat(){
    $("#myModal").show();
  }
  logout(){
    this.userService.logout();
    this.router.navigate(['login'])
  }
  scrollTo(key: string){
    $('html').scrollTop($("#"+ key).offset().top)
  }
  toggleNotification(){
    $("#notification").slideToggle(500);
  }
  goToSourceNoti(noti: any){
    if(noti.notification.title === "New comment"){
      this.scrollTo("message"+ noti.data.post_id);
    }
    if(noti.notification.title === "New post"){
      this.scrollTo("message1");
    }
  }
}
