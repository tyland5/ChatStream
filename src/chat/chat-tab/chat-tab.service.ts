import { Injectable, OnDestroy } from "@angular/core";
import { ActiveChat, ChatListResponse, User } from "../../interfaces/interfaces";
import { BehaviorSubject, Subscription } from "rxjs";
import { PersonalUserInfoService } from "../../global-services/personalUserinfo.service";
import { environment } from "../../environments/environment";
import { HttpClient } from "@angular/common/http";

// ONLY ALLOWED TO BE USED IN THE PRIVATE CHAT TAB
@Injectable()
export class ChatTabService implements OnDestroy{
    chatList: BehaviorSubject<ChatListResponse[]> = new BehaviorSubject([] as ChatListResponse[])
    friendList: BehaviorSubject<User[]> = new BehaviorSubject([] as User[])
    activeChat: BehaviorSubject<ActiveChat> = new BehaviorSubject({chatId:"", chatName: "", members:[] as string[]})

    personalUserInfoServiceSubscription: Subscription
    csrfSubscription: Subscription
    uid: string;
    csrf: string;

    constructor(private personalUserInfoService:  PersonalUserInfoService, private http: HttpClient){
        this.personalUserInfoServiceSubscription = this.personalUserInfoService.userInfo.subscribe(info=> this.uid = info.id)
        this.csrfSubscription = this.personalUserInfoService.csrf.subscribe(csrf=> this.csrf = csrf)
    }

    ngOnDestroy(): void {
        this.personalUserInfoServiceSubscription.unsubscribe()
    }

    updateChatList(newChatList: ChatListResponse[]){
        this.chatList.next(newChatList)
    }

    updateFriendList(newFriendList: User[]){
        this.friendList.next(newFriendList)
    }

    updateActiveChat(newActiveChat: ActiveChat){
        this.activeChat.next(newActiveChat)
    }

    // for leaving gc
    removeChat(chatId:string){
        const filteredChatList = this.chatList.value.filter(chat => chat.id != chatId)
        
        if(this.activeChat.value.chatId === chatId){
            this.activeChat.next({chatId:"", chatName: "", members:[] as string[]})
        }

        this.chatList.next(filteredChatList)
    }  

    
    hideChat(chatId:string){
        this.http.put<{updated: boolean}>(environment.apiBaseUrl + "/push-hidden-chat", {chatId: chatId}, {responseType:"json", withCredentials: true, headers:{"csrf": this.csrf}})
        .subscribe(response=>{
            if(!response.updated){
                return
            }
            
            const modifiedChatList = this.chatList.value.map(chat =>{
                if(chat.id === chatId){
                    return{...chat, hidden:[this.uid]}
                }
                return chat
            })
            
            if(this.activeChat.value.chatId === chatId){
                this.activeChat.next({chatId:"", chatName: "", members:[] as string[]})
            }
    
            this.chatList.next(modifiedChatList)
        })
    }  

    unhideChat(chatId:string){
        this.http.put<{updated: boolean}>(environment.apiBaseUrl + "/pull-hidden-chat", {chatId: chatId}, {responseType:"json", withCredentials: true, headers:{"csrf": this.csrf}})
        .subscribe(response=>{
            if(!response.updated){
                return
            }
            const modifiedChatList = this.chatList.value.map(chat =>{
                if(chat.id === chatId){
                    return{...chat, hidden:[]}
                }
                return chat
            })
            
            if(this.activeChat.value.chatId === chatId){
                this.activeChat.next({chatId:"", chatName: "", members:[] as string[]})
            }

            this.chatList.next(modifiedChatList)
        })
    }
}