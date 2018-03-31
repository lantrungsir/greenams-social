import { Component, OnInit } from '@angular/core';
import { UserService } from '../user.service';
import {Router} from '@angular/router';
import { ViewChild } from '@angular/core';
import * as $ from "jquery"
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

@ViewChild("navIcon") nav;
  constructor(private userService : UserService, private route: Router) { }


  ngOnInit() {
  }
  fbLogin(){
    this.userService.fbLogin().then(()=>{
      console.log("successful login");
      this.route.navigate(["/dashboard"]);
    })
    .catch(()=>{
      console.log("could not login");
      this.route.navigate(["/login"])
    })
  }
  openNav(){
    this.nav.nativeElement.style.width = "60%";
    this.nav.nativeElement.style.display = "block";
  }
  closeNav(){
    this.nav.nativeElement.style.display = "none";
  }
  onMouseOver(event):void{
    console.log(event);
  }
  
}
