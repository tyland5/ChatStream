import {RxStomp, IMessage } from '@stomp/rx-stomp';
import { Injectable } from '@angular/core';
import { isDevMode } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class RxStompServiceBase extends RxStomp {
    constructor() {
      super();
    }
}

@Injectable({
  providedIn: 'root',
})
export class RxStompService{

    constructor(private rxStompBase: RxStompServiceBase){
      let brokerUrl = "" 
      
      if(isDevMode()){
        brokerUrl = "ws://localhost:8080/chatstream-websocket"
      }
      else{
        brokerUrl = "wss://chatstreamapi-300058610746.us-east4.run.app/chatstream-websocket"
      }

      this.rxStompBase.configure({
          brokerURL: brokerUrl
        })
        this.rxStompBase.activate();
    }

    getConnection(){
        return this.rxStompBase;
    }
}