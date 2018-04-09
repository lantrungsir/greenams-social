import { Component, OnInit } from '@angular/core';
import {UserService} from "../user.service"
@Component({
  selector: 'app-messenger',
  templateUrl: './messenger.component.html',
  styleUrls: ['./messenger.component.scss']
})
export class MessengerComponent implements OnInit {
  currentUser : any
  constructor(private userService : UserService) {
    this.userService.getCurrentUser().then((user)=>{
      this.currentUser = user
    })
   }

  ngOnInit() {
  }

}
