import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject, pipe, catchError, throwError, switchMap} from 'rxjs';
import { ChatListResponse, FinalChatListResponse, User } from '../../interfaces/interfaces';

@Injectable({
  providedIn: 'root',
})
export class ChatListService {
    constructor(private http:HttpClient){}
    
    getChatlist(){
        let retrievedChatList = new Subject<ChatListResponse[] | FinalChatListResponse>();
        let chatList: ChatListResponse[] | FinalChatListResponse= [] 
        
        // MAKE SURE WITH CREDENTIALS IS THERE OR CROSS SITE COOKIES WONT BE ALLOWED
        this.http.get<ChatListResponse[] | FinalChatListResponse>('http://localhost:8080/get-chatlist', {responseType: "json", withCredentials: true})
        .pipe(switchMap((response) => {
            chatList = response as ChatListResponse[]

            let userIds: string[] = []
            chatList.forEach((chat) =>{
                userIds = userIds.concat(chat.members)
            })
            
            console.log(response)
            return this.http.get('http://localhost:8080/get-user-info',{params: {uids: userIds}, responseType: "json", withCredentials: true});
        }))
        
        .subscribe((response2)=>{
            console.log("response 2 jsakfjas;fdjsfas;fsfsafsafsaf")
            console.log(response2)
            retrievedChatList.next({chatlist: chatList as ChatListResponse[], users: response2 as User[]})
        })
        
        return retrievedChatList.asObservable();
    }

    /*
    getChatlist(){
        let retrievedChatList = new Subject<ChatListResponse[]>();
        
        // MAKE SURE WITH CREDENTIALS IS THERE OR CROSS SITE COOKIES WONT BE ALLOWED
        this.http.get<ChatListResponse[]>('http://localhost:8080/get-chatlist', {responseType: "json", withCredentials: true})
        .pipe(catchError(error => {
            if(error.status == 401){
                retrievedChatList.next([])
            }
            return throwError("invalid credentials")
        }))
        .subscribe((response: ChatListResponse[]) => {
            console.log(response)
            retrievedChatList.next(response) // you publish changes to the subscriber
        });

        return retrievedChatList.asObservable();
    }
        */
}