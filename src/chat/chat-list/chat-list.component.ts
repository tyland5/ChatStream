import { Component, OnInit, Input, Output, EventEmitter, OnDestroy} from '@angular/core';
import { ChatListElement } from '../chat-list-element/chat-list-element.component';
import { FinalChatListResponse, ChatListResponse, User, ActiveChat } from '../../interfaces/interfaces';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {MatIconModule} from '@angular/material/icon';
import { CreateChat } from "../create-chat/create-chat.component";
import { ChatTabService } from '../chat-tab/chat-tab.service';
import { Subscription } from 'rxjs';
import { PersonalUserInfoService } from '../../global-services/personalUserinfo.service';

@Component({
  selector: 'chat-list',
  standalone: true,
  imports: [ChatListElement, CommonModule, MatIconModule, FormsModule, CreateChat],
  templateUrl: './chat-list.component.html'
})
export class ChatList implements OnInit, OnDestroy{
  
  @Input() userInfoDict:  { [id: string]: User } = {} // comprehensive for all chats. maybe pass down info of particular chat in future?
  activeChatId: string = ""
  creatingNewChat: boolean = false
  chatList: ChatListResponse[] = []
  chatListSubscription: Subscription;
  activeChatSubscription: Subscription;

  personalUserInfo: User = {} as User
  personalUserInfoSubscription: Subscription

  constructor(private chatTabService: ChatTabService, private personalUserInfoService: PersonalUserInfoService){}

  ngOnInit(): void {
    this.chatListSubscription = this.chatTabService.chatList.subscribe(newChatList => {
      this.chatList = newChatList
    })

    this.activeChatSubscription = this.chatTabService.activeChat.subscribe(newActiveChat => {
      this.activeChatId = newActiveChat.chatId
    })

    this.personalUserInfoSubscription = this.personalUserInfoService.userInfo.subscribe(info=> this.personalUserInfo = info)
  }

  ngOnDestroy(): void {
    this.chatListSubscription.unsubscribe()
    this.activeChatSubscription.unsubscribe()
    this.personalUserInfoSubscription.unsubscribe()
  }

  // helper function for ngFor of chatlist element
  getChatName(chat: ChatListResponse): string{
    if(chat.chatName != ""){
      return chat.chatName as string
    }

    const selfUid = this.personalUserInfo.id
    let chatName: string = ""

    // find the other user's name
    chat.members.forEach(userId => {
      if(userId != selfUid){
        chatName = this.userInfoDict[userId].name
      }
    });

    return chatName
  }

  getChatPic(chat: ChatListResponse): string{
    if(chat.members.length > 2){
      return chat.chatPic as string
    }

    const selfUid = this.personalUserInfo.id
    let chatPic: string = ""

    // find the other user's pfp
    chat.members.forEach(userId => {
      if(userId != selfUid){
        chatPic = this.userInfoDict[userId].pfp
      }
    });

    return chatPic

  }

  // i need this?? passing chat.latestMessage doesn't working in input in this component.html
  getLatestMessage(chat: ChatListResponse){
    if(chat.latestMessage === null){
      return {name: "", message: ""}
    }
    const senderName: string = this.userInfoDict[chat.latestMessage.uid].name
    return {name: senderName, message:chat.latestMessage.message}
  }

  closeCreateChat(newActiveChatId: string){
    this.creatingNewChat = false

    if(newActiveChatId === ""){
      return
    }
  }

  isVisible(chat:ChatListResponse){
    if(chat?.hidden && chat.hidden.includes(this.personalUserInfo.id)){
      return false
    }
    return true
  }
}
