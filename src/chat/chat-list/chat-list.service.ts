import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject, pipe, catchError, throwError, switchMap} from 'rxjs';
import { ChatListResponse, FinalChatListResponse, User } from '../../interfaces/interfaces';
import { RxStompService, RxStompServiceBase } from '../../global-services/rxstomp.service';
import { environment } from '../../environments/environment';

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
        this.http.get<ChatListResponse[] | FinalChatListResponse>(environment.apiBaseUrl + '/get-chatlist', {responseType: "json", withCredentials: true})
        .pipe(switchMap((response) => {
            chatList = (response as unknown as {list: ChatListResponse[]}).list as ChatListResponse[]

            let userIds: string[] = []
            chatList.forEach((chat) =>{
                userIds = userIds.concat(chat.members)
            })
            
            return this.http.get(environment.apiBaseUrl + '/get-user-info',{params: {uids: userIds}, responseType: "json", withCredentials: true});
        }))
        
        .subscribe((response2)=>{
            const users = (response2 as {uinfo:User[]}).uinfo
            retrievedChatList.next({chatlist: chatList as ChatListResponse[], users:users})
        })
        
        return retrievedChatList.asObservable();
    }

    getChatlistSubscription(userId: string){
        return this.rxStomp.watch("/chatlist/" + userId);
    }

    createNewChat(chatMembers: string[]){

        // first create a new row in the table
        this.http.post<{chat: ChatListResponse}>(environment.apiBaseUrl + "/create-chat", {chatMembers: chatMembers}, {responseType:"json", withCredentials: true})
        .subscribe(response => {
            const newChat = response.chat
            chatMembers.forEach(member => {
            this.rxStomp.publish({destination: '/chatlist/updateChatlist/' + member,  body: JSON.stringify(newChat)})
            })
        })
        //this.rxStomp.publish({destination: '/chatlist/' + })
    }
}