import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject, pipe, catchError, throwError, switchMap} from 'rxjs';
import { ChatListResponse, FinalChatListResponse, User } from '../../interfaces/interfaces';
import { RxStompService, RxStompServiceBase } from '../../global-services/rxstomp.service';

@Injectable({
  providedIn: 'root',
})
export class ChatListService {
    rxStomp: RxStompServiceBase;

    constructor(private http:HttpClient, private rxStompService: RxStompService){
        this.rxStomp = this.rxStompService.getConnection();
    }
    
    getChatlist(){
        let retrievedChatList = new Subject<FinalChatListResponse>();
        let chatList: ChatListResponse[] | FinalChatListResponse= [] 
        
        // MAKE SURE WITH CREDENTIALS IS THERE OR CROSS SITE COOKIES WONT BE ALLOWED
        this.http.get<ChatListResponse[] | FinalChatListResponse>('http://localhost:8080/get-chatlist', {responseType: "json", withCredentials: true})
        .pipe(switchMap((response) => {
            chatList = response as ChatListResponse[]

            let userIds: string[] = []
            chatList.forEach((chat) =>{
                userIds = userIds.concat(chat.members)
            })
            
            return this.http.get('http://localhost:8080/get-user-info',{params: {uids: userIds}, responseType: "json", withCredentials: true});
        }))
        
        .subscribe((response2)=>{
            retrievedChatList.next({chatlist: chatList as ChatListResponse[], users: response2 as User[]})
        })
        
        return retrievedChatList.asObservable();
    }

    getChatlistSubscription(userId: string){
        return this.rxStomp.watch("/chatlist/" + userId);
    }

    createNewChat(chatMembers: string[]){

        // first create a new row in the table
        this.http.post<ChatListResponse>("http://localhost:8080/create-chat", {chatMembers: chatMembers}, {responseType:"json", withCredentials: true})
        .subscribe(newChat => {
          console.log("NEW CHAT CREATED WITH DETAILS")
          console.log(newChat)
          chatMembers.forEach(member => {
            this.rxStomp.publish({destination: '/chatlist/updateChatlist/' + member,  body: JSON.stringify(newChat)})
          })
        })
        //this.rxStomp.publish({destination: '/chatlist/' + })
    }
}