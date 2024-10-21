import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subject } from 'rxjs';
import { MessageResponse } from '../../interfaces/interfaces';
import {RxStomp } from '@stomp/rx-stomp';

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

    sendMessage(message: string, chatId: string, sender:string, sentAt:string){
      this.rxStompService.publish({ destination: '/chat/sendChat/' + chatId, body: JSON.stringify({message: message, chatId: chatId, sender:sender, sentAt:sentAt}) });
    }

    getMessages(chatId: string){
      const chatMessages = new Subject<MessageResponse[]>();

      this.http.get<MessageResponse[]>('http://localhost:8080/get-messages', {responseType:"json", withCredentials: true, params:{chatId:chatId}}).subscribe(messages =>{
        console.log(messages)
        chatMessages.next(messages)
      })

      return chatMessages.asObservable();
    }

    /*
    sendMessage(message: string, chatId: string, sender:string, sentAt:string){
        let messageSent = new Subject<boolean>();
        let csrf = localStorage.getItem("csrf");
        
        if (csrf == null){
          csrf = ""
        }

        const headerDict = new HttpHeaders({
          'csrf': csrf,
          'Content-Type': 'application/json'
        })

        this.http.post('http://localhost:8080/send-message', {message: message, chatId: chatId, sender:sender, sentAt:sentAt}, 
          {responseType:"json", withCredentials: true, headers: headerDict}).subscribe(response => {
          messageSent.next(true)
        });

        return messageSent.asObservable();
    }
    */
}