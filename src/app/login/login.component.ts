import { Component, OnInit } from '@angular/core';
import { UserService } from '../user.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

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
}
