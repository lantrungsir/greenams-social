import { Injectable } from '@angular/core';
import * as io from "socket.io-client"
@Injectable()
export class UpdateService {
  
  constructor(public socket: Object) { 
    this.socket = io();
  }
}
