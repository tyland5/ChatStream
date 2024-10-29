import {RxStomp, IMessage } from '@stomp/rx-stomp';
import { Injectable } from '@angular/core';

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
        this.rxStompBase.configure({
            brokerURL:"ws://localhost:8080/chatstream-websocket"
          })
          this.rxStompBase.activate();
    }

    getConnection(){
        return this.rxStompBase;
    }
}