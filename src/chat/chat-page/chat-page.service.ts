import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subject, Observable} from 'rxjs';
import { ChatListResponse, MessageResponse } from '../../interfaces/interfaces';
import { RxStompService, RxStompServiceBase } from '../../global-services/rxstomp.service';

@Injectable({
  providedIn: 'root',
})
export class ChatPageService {
    rxStomp: RxStompServiceBase;

    constructor(private http:HttpClient, private rxStompService: RxStompService){
      // setup the stomp service
      this.rxStomp = this.rxStompService.getConnection()
    }

    changeSubscription(chatId: string){
      return this.rxStomp.watch("/chat/" + chatId);
    }

    deactivateStompService(){
      this.rxStomp.deactivate();
    }

    sendMessage(message: string, chatId: string, sender:string){
      const sentAt = Date.now()

      this.rxStomp.publish({ destination: '/chat/sendChat/' + chatId, body: JSON.stringify({message: message, chatId: chatId, sender:sender, sentAt:sentAt}) });
    }

    getMessages(chatId: string){
      const chatMessages = new Subject<MessageResponse[]>();

      this.http.get<MessageResponse[]>('http://localhost:8080/get-messages', {responseType:"json", withCredentials: true, params:{chatId:chatId}}).subscribe(messages =>{
        chatMessages.next(messages)
      })

      return chatMessages.asObservable();
    }
}