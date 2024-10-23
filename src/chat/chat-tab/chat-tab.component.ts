import { Component, OnDestroy, OnInit } from '@angular/core';
import { ChatPage } from '../chat-page/chat-page.component';
import { ChatListElement } from '../chat-list-element/chat-list-element.component';
import { ChatListService } from '../chat-list/chat-list.service';
import { FinalChatListResponse, ChatListResponse, User, ActiveChat, MessageResponse } from '../../interfaces/interfaces';
import { FriendsService } from '../../user/friends/friends.service';
import { ChatList } from '../chat-list/chat-list.component';
import { Observable, Subscription } from 'rxjs';
import { IMessage } from '@stomp/rx-stomp';
import { ChatPageService } from '../chat-page/chat-page.service';

@Component({
  selector: 'forgot-password',
  standalone: true,
  imports: [ChatPage, ChatListElement, ChatList],
  templateUrl: './chat-tab.component.html'
})
export class ChatTab implements OnInit, OnDestroy{
  
  chatList: ChatListResponse[] = []
  friendList: User[]
  userInfoDict:  { [id: string]: User } = {} // comprehensive for all chats. maybe pass down info of particular chat in future?
  activeChatId: string = ""
  activeChatName: string = ""
  creatingNewChat: boolean = false
 
  chatSubscriptions : Subscription[] = []

  constructor(private chatlistService: ChatListService, private chatPageService: ChatPageService, private friendsService: FriendsService){}
  
  ngOnInit(): void {
    this.chatlistService.getChatlist().subscribe((chatList: FinalChatListResponse)=>{
      if(chatList){
        const users = chatList.users
        users.forEach(user => {
          this.userInfoDict[user.id] = user 
        });

        this.chatList = chatList.chatlist

        chatList.chatlist.forEach((chat: ChatListResponse) =>{
          // create observable for this component and chat page component first
          const chatPubSub = this.chatPageService.changeSubscription(chat.id)

          const chatSub = chatPubSub.subscribe(message => {
            const messageObj: MessageResponse= JSON.parse(message.body)
            
            const index = this.chatList.findIndex((chat) => chat.id === messageObj.chatId)
            this.chatList[index] = {...this.chatList[index], latestMessage:{uid: messageObj.sender, message: messageObj.message}}
            this.chatList = [this.chatList[index], ...this.chatList.slice(0, index), ...this.chatList.slice(index+1)] // slice handles out of bounds 
          })

          this.chatSubscriptions.push(chatSub)
        })
      }
    })

    this.friendsService.getFriends(localStorage.getItem('uid') as string).subscribe(friendList => {
      this.friendList = friendList
    })
  }

  ngOnDestroy(): void {
    this.chatSubscriptions.forEach(subscription => {
      subscription.unsubscribe()
    })
  }

  changeActiveChat(event: ActiveChat){
    this.activeChatId = event.chatId
    this.activeChatName = event.chatName
  }
}
