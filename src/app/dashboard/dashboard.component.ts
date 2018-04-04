import { Component, OnInit } from '@angular/core';
import { UserService } from '../user.service';
import { Router } from '@angular/router';
import { AuthHttp } from 'angular2-jwt';
import { ViewChild } from '@angular/core';
import * as $ from "jquery"
import * as io from "socket.io-client"
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
  constructor(private userService : UserService, private router: Router, private http :AuthHttp) {

    this.userService.getCurrentUser().then((user)=>{
      this.CurrentUser = user
      this.getPost()
      .then((postsData)=>{
        this.posts = postsData;
      })
    }).catch(()=>{
      this.userService.logout();
      this.router.navigate(["/login"])
    })

    this.socket = io();
    this.socket.emit("post-on", {uid : localStorage.getItem('id')})
    this.socket.on("online", function(data){
      //add to array

    })
    this.socket.on("new-post",(data)=>{
      this.addPost(data.post)
    })
    this.socket.on("update-post", function(data){
      var id = data.id;
      var post = data.data;
      for(var i = 0; i< this.posts.length; i++){
        if(i + parseInt(id.toString()) === this.posts.length){
          this.posts[i] =  post;
        }
      }
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
    this.addPost(newPost)
    this.http.post("api/posts", {
      new_post : newPost
    }).toPromise().then((res)=>{
      console.log(res.text());
      this.socket.emit("new-post", {post: newPost})
    })
    this.makeFileRequest();
  }

  fileChangeEvent(fileInput: any){
    this.FilesToUpload = <Array<File>> fileInput.target.files;
  }

  makeFileRequest(){
    var formData = new FormData();
    for(var i =0 ;i< this.FilesToUpload.length; i++){
      formData.append("uploads", this.FilesToUpload[i], this.FilesToUpload[i].name);
    }
    this.http.post("api/upload?post_id="+this.posts.length, formData).toPromise().then((res)=>{
      var id = res.json().id;
      var post =res.json().data;
      for(var i = 0;i < this.posts.length;i++){
        if(i + parseInt(id)=== this.posts.length){
          this.posts[i].links = post.links;
          this.posts[i].images = post.images;
        }
      }
    });
    this.FilesToUpload = null;
  }

}
