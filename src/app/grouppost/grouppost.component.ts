import { Component, OnInit } from '@angular/core';
import * as $ from "jquery"
import { Input } from '@angular/core';
import {UpdateService} from "../update.service"
@Component({
  selector: 'app-grouppost',
  templateUrl: './grouppost.component.html',
  styleUrls: ['./grouppost.component.css']
})
export class GrouppostComponent implements OnInit {
  isImage = false
  isComment =false
  isLike = false
  socket:any

  @Input() post :any
  slideIndex: number = 1;
  constructor(private ioService: UpdateService) {
    this.socket = this.ioService.socket;
   }

  ngOnInit() {
    if(this.post.images.length > 0){
      this.isImage = true
    }
    else{
      this.isImage = false;
    }

    if(this.post.likes.length > 0){
      this.isLike = true
    }
    else{
      this.isLike = false;
    }
    
    if(this.post.images.length > 0){
      this.isLike = true
    }
    else{
      this.isLike = false;
    }
    this.showDivs(this.slideIndex);
  }
  plusDivs(n: number){
    this.slideIndex = this.slideIndex +n;
    this.showDivs(this.slideIndex);
  }
  showDivs(n: number) {
  var ourPostId = this.post.id
  var x = $(".mySlides"+ourPostId);
  if (n > x.length) {this.slideIndex = 1}    
  if (n < 1) {this.slideIndex = x.length}
  var id = this.slideIndex-1;
  console.log(id)
    $(".mySlides"+ourPostId).each(function(index){
      if(index === id){
       $(this).show();
      }
      else{
       $(this).hide()
      }
    })
  }

  //add likes
  toggleLike(){
    //physically change the element
    if(this.post.likes.indexOf(localStorage.getItem('id'))!== -1){
      $("#button-like").css("background-color" , "green");
      this.post.likes.push(localStorage.getItem('id'))
      this.socket.emit("like", {
        id : localStorage.getItem("id"),
        post_id : this.post.id
      });
    }
    else{
      $("#button-like").css("background-color" , "black");
      this.post.likes.splice(this.post.likes.indexOf(localStorage.getItem('id')),1)
      this.socket.emit("unlike", {
        id : localStorage.getItem("id"),
        post_id : this.post.id
      });
    }
    }
  //add comment
  showCommentBox(){
    $("#comment-box").show(500);
  }
}
