import { Component, OnInit, Input, Output, EventEmitter, OnDestroy} from '@angular/core';
import { ChatPage } from '../chat-page/chat-page.component';
import { ChatListElement } from '../chat-list-element/chat-list-element.component';
import { FinalChatListResponse, ChatListResponse, User, ActiveChat } from '../../interfaces/interfaces';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {MatIconModule} from '@angular/material/icon';
import { CreateChat } from "../create-chat/create-chat.component";
import { ChatTabService } from '../chat-tab/chat-tab.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'chat-list',
  standalone: true,
  imports: [ChatPage, ChatListElement, CommonModule, MatIconModule, FormsModule, CreateChat],
  templateUrl: './chat-list.component.html'
})
export class ChatList implements OnInit, OnDestroy{
  
  @Input() userInfoDict:  { [id: string]: User } = {} // comprehensive for all chats. maybe pass down info of particular chat in future?
  activeChat: ActiveChat = {chatId: "", chatName: ""}
  creatingNewChat: boolean = false
  chatList: ChatListResponse[] = []
  chatListSubscription: Subscription;
  activeChatSubscription: Subscription;

  constructor(private chatTabService: ChatTabService){}

  ngOnInit(): void {
    this.chatListSubscription = this.chatTabService.chatList.subscribe(newChatList => {
      this.chatList = newChatList
    })

    this.activeChatSubscription = this.chatTabService.activeChat.subscribe(newActiveChat => {
      this.activeChat = newActiveChat
    })
  }

  ngOnDestroy(): void {
    this.chatListSubscription.unsubscribe()
    this.activeChatSubscription.unsubscribe()
  }

  // helper function for ngFor of chatlist element
  getChatName(chat: ChatListResponse): string{
    if(chat.members.length > 2){
      return "GROUP CHAT PLACEHOLDER NAME"
    }

    const selfUid = localStorage.getItem("uid")
    let chatName: string = ""

    // find the other user's name
    chat.members.forEach(userId => {
      if(userId != selfUid){
        chatName = this.userInfoDict[userId].name
      }
    });

    return chatName
  }

  // i need this?? passing chat.latestMessage doesn't working in input in this component.html
  getLatestMessage(chat: ChatListResponse){
    if(chat.latestMessage === null){
      return {name: "", message: ""}
    }
    const senderName: string = this.userInfoDict[chat.latestMessage.uid].name
    return {name: senderName, message:chat.latestMessage.message}
  }

  getChatId(chat: ChatListResponse){
    return chat.id
  }

  closeCreateChat(newActiveChatId: string){
    this.creatingNewChat = false

    if(newActiveChatId === ""){
      return
    }
  }
}
