import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subject } from 'rxjs';
import { MessageResponse } from '../../interfaces/interfaces';

@Injectable({
  providedIn: 'root',
})
export class ChatPageService {
    constructor(private http:HttpClient){}

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

    getMessages(chatId: string){
      const chatMessages = new Subject<MessageResponse[]>();

      this.http.get<MessageResponse[]>('http://localhost:8080/get-messages', {responseType:"json", withCredentials: true, params:{chatId:chatId}}).subscribe(messages =>{
        console.log(messages)
        chatMessages.next(messages)
      })

      return chatMessages.asObservable();
    }
}