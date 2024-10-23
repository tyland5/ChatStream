import { Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import { ChatPage } from '../chat-page/chat-page.component';
import { ChatListElement } from '../chat-list-element/chat-list-element.component';
import { FinalChatListResponse, ChatListResponse, User, ActiveChat } from '../../interfaces/interfaces';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {MatIconModule} from '@angular/material/icon';
import { CreateChat } from "../create-chat/create-chat.component";

@Component({
  selector: 'chat-list',
  standalone: true,
  imports: [ChatPage, ChatListElement, CommonModule, MatIconModule, FormsModule, CreateChat],
  templateUrl: './chat-list.component.html'
})
export class ChatList{
  
  @Input() chatList: ChatListResponse[] = []
  @Input() friendList: User[]
  @Input() userInfoDict:  { [id: string]: User } = {} // comprehensive for all chats. maybe pass down info of particular chat in future?
  activeChat: ActiveChat = {chatId: "", chatName: ""}
  creatingNewChat: boolean = false

  // signal to chat tab so it can pass updated info to chat-page component
  @Output() changeActiveChat = new EventEmitter<ActiveChat>();

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
    const senderName: string = this.userInfoDict[chat.latestMessage.uid].name
    return {name: senderName, message:chat.latestMessage.message}
  }

  getChatId(chat: ChatListResponse){
    return chat.id
  }

  changeActiveChatFunction(event: ActiveChat){
    this.activeChat = event
    this.changeActiveChat.emit(this.activeChat)
  }
}
