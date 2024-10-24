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
import { ChatTabService } from './chat-tab.service';

@Component({
  selector: 'forgot-password',
  standalone: true,
  imports: [ChatPage, ChatListElement, ChatList],
  templateUrl: './chat-tab.component.html'
})
export class ChatTab implements OnInit, OnDestroy{
  
  chatList: ChatListResponse[] = []
  userInfoDict:  { [id: string]: User } = {} // comprehensive for all chats. maybe pass down info of particular chat in future?
  activeChatId: string = ""
  activeChatName: string = ""
  creatingNewChat: boolean = false
 
  chatSubscriptions : Subscription[] = []
  chatListSubscription: Subscription;
  chatListRxStomp: Subscription;

  constructor(private chatlistService: ChatListService, private chatPageService: ChatPageService, private friendsService: FriendsService, private chatTabService: ChatTabService){
  }
  
  // keeping these calls here because if I switched to mobile view and conditionally rendered chatlist, then these would always execute on init when it shouldn't
  ngOnInit(): void {

    // need this for createChatSubscription (to update chat list properly when using chat publish subscribe websocket)
    this.chatListSubscription = this.chatTabService.chatList.subscribe(newChatList => {
      this.chatList = newChatList
    })

    this.chatListRxStomp = this.chatlistService.getChatlistSubscription(localStorage.getItem("uid") as string).subscribe(response => {
      const newChat: ChatListResponse = JSON.parse(response.body)
      this.chatTabService.updateChatList([newChat, ...this.chatList])
      this.createChatSubscription(newChat)
    })

    this.chatlistService.getChatlist().subscribe((finalChatListResponse: FinalChatListResponse)=>{
      if(finalChatListResponse){
        const users = finalChatListResponse.users
        users.forEach(user => {
          this.userInfoDict[user.id] = user 
        });

        const chatList = finalChatListResponse.chatlist
        this.chatTabService.updateChatList(chatList)

        chatList.forEach((chat: ChatListResponse) =>{
          this.createChatSubscription(chat)
        })
      }
    })

    this.friendsService.getFriends(localStorage.getItem('uid') as string).subscribe(friendList => {
      this.chatTabService.updateFriendList(friendList)
    })
  }

  ngOnDestroy(): void {
    this.chatSubscriptions.forEach(subscription => {
      subscription.unsubscribe()
    })

    this.chatListSubscription.unsubscribe()
    this.chatListRxStomp.unsubscribe()
  }

  createChatSubscription(chat: ChatListResponse) : void{
    // create observable for this component and chat page component first
    const chatPubSub = this.chatPageService.changeSubscription(chat.id)

    const chatSub = chatPubSub.subscribe(message => {
      const messageObj: MessageResponse= JSON.parse(message.body)
      
      const index = this.chatList.findIndex((chat) => chat.id === messageObj.chatId)
      this.chatList[index] = {...this.chatList[index], latestMessage:{uid: messageObj.sender, message: messageObj.message}}
      this.chatTabService.updateChatList([this.chatList[index], ...this.chatList.slice(0, index), ...this.chatList.slice(index+1)]) // slice handles out of bounds 
    })

    this.chatSubscriptions.push(chatSub)
  }
}
