import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subject, Observable} from 'rxjs';
import { MessageResponse } from '../../interfaces/interfaces';
import {RxStomp, IMessage } from '@stomp/rx-stomp';


@Injectable({
  providedIn: 'root',
})
class RxStompService extends RxStomp {
  constructor() {
    super();
  }
}

@Injectable({
  providedIn: 'root',
})
export class ChatPageService {

    constructor(private http:HttpClient, private rxStompService: RxStompService){
      // setup the stomp service

      this.rxStompService.configure({
        brokerURL:"ws://localhost:8080/chatstream-websocket"
      })
      this.rxStompService.activate();
    }

    changeSubscription(chatId: string){
      return this.rxStompService.watch("/chat/" + chatId);
    }

    deactivateStompService(){
      this.rxStompService.deactivate();
    }

    sendMessage(message: string, chatId: string, sender:string){
      const sentAt = Date.now()

      this.rxStompService.publish({ destination: '/chat/sendChat/' + chatId, body: JSON.stringify({message: message, chatId: chatId, sender:sender, sentAt:sentAt}) });
    }

    getMessages(chatId: string){
      const chatMessages = new Subject<MessageResponse[]>();

      this.http.get<MessageResponse[]>('http://localhost:8080/get-messages', {responseType:"json", withCredentials: true, params:{chatId:chatId}}).subscribe(messages =>{
        chatMessages.next(messages)
      })

      return chatMessages.asObservable();
    }
}