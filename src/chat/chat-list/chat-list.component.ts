import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { ChatPage } from '../chat-page/chat-page.component';
import { ChatListElement } from '../chat-list-element/chat-list-element.component';
import { ChatListService } from './chat-list.service';
import { FinalChatListResponse, ChatListResponse, User, ActiveChat } from '../../interfaces/interfaces';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {MatIconModule} from '@angular/material/icon';
import { FriendsService } from '../../user/friends/friends.service';
import { CreateChat } from "../create-chat/create-chat.component";

@Component({
  selector: 'forgot-password',
  standalone: true,
  imports: [ChatPage, ChatListElement, CommonModule, MatIconModule, FormsModule, CreateChat],
  templateUrl: './chat-list.component.html'
})
export class ChatList implements OnInit{
  
  chatList: ChatListResponse[] = []
  friendList: User[]
  userInfoDict:  { [id: string]: User } = {} // comprehensive for all chats. maybe pass down info of particular chat in future?
  activeChatId: string = ""
  activeChatName: string = ""
  creatingNewChat: boolean = false
 

  constructor(private chatlistService: ChatListService, private friendsService: FriendsService){}
  
  ngOnInit(): void {
    this.chatlistService.getChatlist().subscribe(chatList=>{
      if(chatList){
        const users = (chatList as FinalChatListResponse).users
        users.forEach(user => {
          this.userInfoDict[user.id] = user 
        });

        this.chatList = (chatList as FinalChatListResponse).chatlist
      }
    })

    this.friendsService.getFriends(localStorage.getItem('uid') as string).subscribe(friendList => {
      this.friendList = friendList
    })
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
    const senderName: string = this.userInfoDict[chat.latestMessage.uid].name
    return {name: senderName, message:chat.latestMessage.message}
  }

  getChatId(chat: ChatListResponse){
    return chat.id
  }

  changeActiveChatId(event: ActiveChat){
    this.activeChatId = event.chatId
    this.activeChatName = event.chatName
  }
}
