import { Injectable } from '@angular/core';
import * as io from "socket.io-client"
@Injectable()
export class UpdateService {
  
  constructor(public socket: any) { 
    this.socket = io();
  }
}
