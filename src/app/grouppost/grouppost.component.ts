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
  constructor() { }

  ngOnInit() {
    if(this.post.images.length > 0){
      this.isImage = true
    }
    else{
      this.isImage = false;
    }
    this.showDivs(this.slideIndex);
  }
  plusDivs(n) {
    this.showDivs(this.slideIndex += n);
  }

  showDivs(n) {
  var x = $(".mySlides");
  if (n > x.length) {this.slideIndex = 1}    
  if (n < 1) {this.slideIndex = x.length}
    x.each(function(index){
      if(index === this.slideIndex-1){
        $(this).show();
      }
      else{
        $(this).hide();
      }
    })
  }
}
