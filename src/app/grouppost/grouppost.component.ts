import { Component, OnInit } from '@angular/core';
import * as $ from "jquery"
import { Input } from '@angular/core';
@Component({
  selector: 'app-grouppost',
  templateUrl: './grouppost.component.html',
  styleUrls: ['./grouppost.component.css']
})
export class GrouppostComponent implements OnInit {
  isImage = false
  @Input() post :any
  @Input() id : number
  slideIndex: number = 1;
  constructor() {

   }

  ngOnInit() {
    if(this.post.images.length > 0){
      this.isImage = true
    }
    else{
      this.isImage = false;
    }
    this.showDivs(this.slideIndex);
  }
  plusDivs(n: number) {
    this.slideIndex = this.slideIndex +n;
    this.showDivs(this.slideIndex);
  }

  showDivs(n: number) {
  var id = this.slideIndex-1;
  console.log(id)
  var x = $(".mySlides");
  if (n > x.length) {id = 1}    
  if (n < 1) {id = x.length}
    $(".mySlides").each(function(index){
      if(index === id){
       $(this).show();
      }
      else{
       $(this).hide()
      }
    })
  }
}
