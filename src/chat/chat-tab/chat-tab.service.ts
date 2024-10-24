import { Injectable } from "@angular/core";
import { ActiveChat, ChatListResponse, User } from "../../interfaces/interfaces";
import { BehaviorSubject } from "rxjs";

// ONLY ALLOWED TO BE USED IN THE PRIVATE CHAT TAB
@Injectable()
export class ChatTabService{
    chatList: BehaviorSubject<ChatListResponse[]> = new BehaviorSubject([] as ChatListResponse[])
    friendList: BehaviorSubject<User[]> = new BehaviorSubject([] as User[])
    activeChat: BehaviorSubject<ActiveChat> = new BehaviorSubject({chatId:"", chatName: ""})

    updateChatList(newChatList: ChatListResponse[]){
        this.chatList.next(newChatList)
    }

    updateFriendList(newFriendList: User[]){
        this.friendList.next(newFriendList)
    }

    updateActiveChat(newActiveChat: ActiveChat){
        this.activeChat.next(newActiveChat)
    }

}