import { Component, OnInit } from '@angular/core';
import * as $ from "jquery"
import { Input } from '@angular/core';
@Component({
  selector: 'app-grouppost',
  templateUrl: './grouppost.component.html',
  styleUrls: ['./grouppost.component.css']
})
export class GrouppostComponent implements OnInit {
  @Input() post :any
  slideIndex: number = 1;
  constructor() { }

  ngOnInit() {
    this.showDivs(this.slideIndex);
  }
  plusDivs(n) {
    this.showDivs(this.slideIndex += n);
  }

  showDivs(n) {
  var i;
  var x = $(".mySlides");
  if (n > x.length) {this.slideIndex = 1}    
  if (n < 1) {this.slideIndex = x.length}
  x.each(function(index){
    $(this).hide();
    if(index === this.slideIndex-1){
      $(this).show(500)
    }
  })

  }
}
