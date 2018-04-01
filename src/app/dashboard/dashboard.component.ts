import { Component, OnInit } from '@angular/core';
import { UserService } from '../user.service';
import { Router } from '@angular/router';
import { AuthHttp } from 'angular2-jwt';
import { ViewChild } from '@angular/core';
import * as $ from "jquery"
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  @ViewChild("navDemo") nav ;
  CurrentUser : any
  posts: any
  constructor(private userService : UserService, private router: Router, private http :AuthHttp) {

    this.userService.getCurrentUser().then((user)=>{
      this.CurrentUser = user
    }).catch(()=>{
      this.userService.logout();
      this.router.navigate(["/login"])
    })

    this.getPost()
    .then((postsData)=>{
      this.posts = postsData;
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
    this.posts.push(post);
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
    var newPost = {};
    Object.defineProperty(newPost, "author", {
      value : localStorage.getItem('id'),
      configurable: true
    });
    Object.defineProperty(newPost, "message", {
      value : $("#newpost").text(),
      configurable: true
    })
    this.addPost(newPost);
    this.http.post("api/posts", {
      new_post : newPost
    }).toPromise().then((res)=>{
      console.log(res.text());
    })
  }
}
