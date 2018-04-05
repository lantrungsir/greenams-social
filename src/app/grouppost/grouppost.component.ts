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
    var thisId = this.post.id
    this.socket.on("like", function(data){
      $("#button-like").css("color" , "red");
      if(parseInt(thisId)+parseInt(data.post_id)-1 === parseInt(data.sum)){
        console.log(data.id)
        this.addLike(data.id)
      }
    })
    this.socket.on("unlike", function(data){
      $("#button-like").css("color" , "black");
      if(parseInt(thisId)+parseInt(data.post_id)-1 === parseInt(data.sum)){
        console.log(data.id)
        this.deleteLike(this.getLikeOrd(data.id))
      }
    })
    this.socket.on("unlike")
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
    
    if(this.post.comments.length > 0){
      this.isComment = true
    }
    else{
      this.isComment = false;
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
  addLike(data){
    this.post.likes.push(data)
  }
  deleteLike(i){
    this.post.likes.splice(i,1)
  }
  getLikeOrd(data){
    return this.post.likes.indexOf(data)
  }
  toggleLike(){
    //physically change the element
    if(this.post.likes !== undefined){
      if(this.post.likes.indexOf(localStorage.getItem('id')) === -1){
        $("#button-like").css("color" , "blue");
        this.isLike = true;
        this.post.likes.push(localStorage.getItem('id'))
        this.socket.emit("like", {
          id : localStorage.getItem("id"),
          post_id : this.post.id
        });
      }
      else{
        $("#button-like").css("color" , "grey");
        this.post.likes.splice(this.post.likes.indexOf(localStorage.getItem('id')),1)
        this.socket.emit("unlike", {
          id : localStorage.getItem("id"),
          post_id : this.post.id
        });
      }
    }
    else{
      $("#button-like").css("color" , "blue");
        this.post.likes.push(localStorage.getItem('id'))
        this.isLike = true
        this.socket.emit("like", {
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
