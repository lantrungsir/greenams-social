import { Component, OnInit } from '@angular/core';
import { UserService } from '../user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  CurrentUser : any
  constructor(private userService : UserService, private router: Router) { }

  ngOnInit() {
    this.userService.getCurrentUser().then((user)=>{
      this.CurrentUser = user
    }).catch(()=>{
      this.userService.logout();
      this.router.navigate(["/login"])
    })
  }
  
}
