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
    // initializes chat list var here with the observable
    this.chatListSubscription = this.chatTabService.chatList.subscribe(newChatList => {
      this.chatList = newChatList
    })

    this.chatListRxStomp = this.chatlistService.getChatlistSubscription(localStorage.getItem("uid") as string).subscribe(response => {
      const newChat: ChatListResponse = JSON.parse(response.body)
      this.chatTabService.updateChatList([newChat, ...this.chatList])
      this.createChatSubscription(newChat)
    })

    // initalizes the observable chatlist that can be viewed in all components of chat tab
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

    // whenever a message update comes from a chat, check if you need to update the chatlist element (moving it on top or updating recent message)
    const chatSub = chatPubSub.subscribe(message => {
      const messageObj: MessageResponse= JSON.parse(message.body)
      const index = this.chatList.findIndex((chat) => chat.id === messageObj.chatId)

      // if message was edited or deleted and was not the most recent, we dont care about updating chatlist
      if(messageObj.type !== "create" && messageObj.id !== this.chatList[index].latestMessage.messageId){
        return
      }

      const messageProperty = messageObj.type === "delete" ? "Message Deleted" : messageObj.message
      const senderIdProperty = messageObj.type === "create" ? messageObj.sender : this.chatList[index].latestMessage.uid
      this.chatList[index] = {...this.chatList[index], latestMessage:{uid: senderIdProperty, message: messageProperty, messageId: messageObj.id}}

      // if someone edits or delete a message, we dont want the chat to appear at the top since not important
      if(messageObj.type === "create"){
        this.chatTabService.updateChatList([this.chatList[index], ...this.chatList.slice(0, index), ...this.chatList.slice(index+1)]) // slice handles out of bounds 
      }
      else{
        this.chatTabService.updateChatList([...this.chatList])
      }
    })

    this.chatSubscriptions.push(chatSub)
  }
}
