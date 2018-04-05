import { Injectable } from '@angular/core';
import * as io from "socket.io-client"
@Injectable()
export class UpdateService {
  public socket :any
  constructor() { 
    this.socket = io();
  }
}
