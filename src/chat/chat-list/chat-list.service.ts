import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject, pipe, catchError, throwError, switchMap, Subscription} from 'rxjs';
import { ChatListResponse, FinalChatListResponse, User } from '../../interfaces/interfaces';
import { RxStompService, RxStompServiceBase } from '../../global-services/rxstomp.service';
import { environment } from '../../environments/environment';
import { PersonalUserInfoService } from '../../global-services/personalUserinfo.service';

@Injectable({
  providedIn: 'root',
})
export class ChatListService implements OnDestroy {
    rxStomp: RxStompServiceBase;
    csrf: string
    csrfSubscription: Subscription

    constructor(private http:HttpClient, private rxStompService: RxStompService, private personalUserInfoService: PersonalUserInfoService){
        this.rxStomp = this.rxStompService.getConnection();
        this.csrfSubscription = this.personalUserInfoService.csrf.subscribe(csrf => {this.csrf = csrf})
    }

    ngOnDestroy(): void {
        this.csrfSubscription.unsubscribe()
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

    createNewChat(chatMembers: string[], chatMemberObjects: User[]){

        // first create a new row in the table
        // then publish with all info about the members in case it has gc with other people a user is not friends with.
        // the one person with none as friends will be able to add them to their user dict when they handle the websocket subscription
        this.http.post<{chat: ChatListResponse}>(environment.apiBaseUrl + "/create-chat", {chatMembers: chatMembers}, {responseType:"json", withCredentials: true, headers:{"csrf": this.csrf}})
        .subscribe(response => {
            const newChat = {...response.chat, memberObjects: chatMemberObjects}
            chatMembers.forEach(member => {
            this.rxStomp.publish({destination: '/chatlist/updateChatlist/' + member,  body: JSON.stringify(newChat)})
            })
        })
       
    }

    // this is primarily for group chat name. should incorporate picture later
    // other users get real time update of when another user changes the name or picture of a group chat
    updateChatInfo(chatName: string, chatId: string){
    
        this.http.put<{updated: boolean}>(environment.apiBaseUrl + "/update-gc-info", {id: chatId, chatName: chatName}, {responseType:"json", withCredentials: true, headers:{"csrf": this.csrf}})
        .subscribe(response=>{
            if(response.updated){
                this.rxStomp.publish({destination: '/chat/updateGcInfo/' + chatId,  body: JSON.stringify({chatId: chatId, message:chatName, type:"update name"})})
            }
        })
    }
}