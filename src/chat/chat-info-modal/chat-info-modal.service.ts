import { Subject, Subscription } from "rxjs";
import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { RxStompService } from "../../global-services/rxstomp.service";
import { RxStompServiceBase } from "../../global-services/rxstomp.service";
import { PersonalUserInfoService } from "../../global-services/personalUserinfo.service";
import { User } from "../../interfaces/interfaces";

@Injectable({
    providedIn: 'root',
})
export class ChatInfoModalService{
    personalUserInfoServiceSubscription: Subscription;
    csrfSubscription: Subscription;
    uid: string;
    csrf: string;

    rxStomp: RxStompServiceBase;

    constructor(private personalUserInfoService:  PersonalUserInfoService, private http: HttpClient, private rxStompService: RxStompService){
        this.personalUserInfoServiceSubscription = this.personalUserInfoService.userInfo.subscribe(info=> this.uid = info.id)
        this.csrfSubscription = this.personalUserInfoService.csrf.subscribe(csrf=> this.csrf = csrf)
        this.rxStomp = this.rxStompService.getConnection()
    }

    //  users are the ones being added
    addToGroupChat(chatId: string, chatName: string, users: User[], members: User[]){
        const membersAdded = new Subject<boolean>();
        const uids = users.map(user => user.id)

        this.http.put<{updated:boolean}>(environment.apiBaseUrl + "/add-to-gc", {chatId: chatId, uids:uids}, {responseType:"json", withCredentials: true, headers:{"csrf": this.csrf}})
        .subscribe(response=>{
            if(response.updated){
                // this publish is so existing group memebers can add new members in the member view. chat tab component handles the publish response
                this.rxStomp.publish({destination: "/chat/updateGcInfo/" + chatId, body:JSON.stringify({chatId: chatId, sender: this.uid, type:"add", message:JSON.stringify(users)})})
                const newMemberList = [...users, ...members]
                // this publish is so the new users add the group chat to their chat list in chat tab component
                uids.forEach(uid=>this.rxStomp.publish({destination:"/chatlist/updateChatlist/" + uid, 
                    body:JSON.stringify({id:chatId, chatName: chatName, memberObjects: newMemberList, members: newMemberList.map(user=>user.id)})}))
                
                membersAdded.next(true)
            }else{membersAdded.next(false)}
        })

        return membersAdded.asObservable()
    }

    leaveGroupChat(chatId: string){
        this.http.put<{updated:boolean}>(environment.apiBaseUrl + "/leave-gc", {chatId: chatId}, {responseType:"json", withCredentials: true, headers:{"csrf": this.csrf}})
        .subscribe(response=>{
            if(response.updated){
                // members will remove user leaving gc from member list while the person leaving will unsubscribe from websocket and delete the chat from chat list. 
                // Done through chat tab component
                this.rxStomp.publish({destination: "/chat/updateGcInfo/" + chatId, body:JSON.stringify({chatId: chatId, sender: this.uid, type:"leave"})})
            }
        })
    }
}