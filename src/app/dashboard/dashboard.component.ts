import { Component, OnInit } from '@angular/core';
import { UserService } from '../user.service';
import { Router } from '@angular/router';
import { AuthHttp } from 'angular2-jwt';
import { ViewChild } from '@angular/core';
import * as $ from "jquery"
import { UpdateService } from '../update.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  private FilesToUpload: File[]
  @ViewChild("navDemo") nav ;
  private socket;
  CurrentUser : any
  posts = []
  constructor(private userService : UserService, private router: Router, private http :AuthHttp, private ioService : UpdateService) {

    this.userService.getCurrentUser().then((user)=>{
      this.CurrentUser = user
      this.getPost()
      .then((postsData)=>{
        this.posts = postsData;
        for(var i = 0;i < this.posts.length ;i++){
          Object.defineProperty(this.posts[i], "id", {
            value : i,
            configurable: true
          })
          console.log("good "+i);
        }
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
      this.addPost(data.post)
    })
   }

  ngOnInit() {
    
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
      value : 0,
      configurable: true
    })
    console.log("good "+0);
    for(var i = 0;i < this.posts.length ;i++){
      Object.defineProperty(this.posts[i], "id", {
        value : i+1,
        configurable: true
      })
      console.log("good "+i);
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
      "author" : {
        name :"",
        profile_pic:"",
        id:""
      },
      "message" : "",
      "time" :""
    }
    Object.defineProperty(newPost, "author", {
      value : {
        name : this.CurrentUser.name,
        profile_pic : this.CurrentUser.profile_pic,
        id : localStorage.getItem('id')
      },
      configurable: true
    });
    Object.defineProperty(newPost, "message", {
      value : $("#newpost").text(),
      configurable: true
    })
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
          Object.defineProperty(newPost,"links", {
            value: data.links,
            configurable: true
          })
          Object.defineProperty(newPost, "images", {
            value: data.images,
            configurable: true
          })
          this.addPost(newPost)
          this.socket.emit("new-post", {post: newPost})
          return;
        })
      }
      this.addPost(newPost)
      this.socket.emit("new-post", {post: newPost})
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
}
