import { Component, OnDestroy, OnInit, HostListener } from '@angular/core';
import { ChatPage } from '../chat-page/chat-page.component';
import { ChatListService } from '../chat-list/chat-list.service';
import { FinalChatListResponse, ChatListResponse, User, ActiveChat, MessageResponse } from '../../interfaces/interfaces';
import { FriendsService } from '../../user/friends/friends.service';
import { ChatList } from '../chat-list/chat-list.component';
import { Observable, Subscription } from 'rxjs';
import { ChatPageService } from '../chat-page/chat-page.service';
import { ChatTabService } from './chat-tab.service';
import { PersonalUserInfoService } from '../../global-services/personalUserinfo.service';

@Component({
  selector: 'forgot-password',
  standalone: true,
  imports: [ChatPage, ChatList],
  templateUrl: './chat-tab.component.html'
})
export class ChatTab implements OnInit, OnDestroy{
  chatList: ChatListResponse[] = []
  userInfoDict:  { [id: string]: User } = {} // comprehensive for all chats. maybe pass down info of particular chat in future?
  creatingNewChat: boolean = false
  activeChat: ActiveChat = {chatId:"",  chatName:"", members:[], isGc:  false}
  chatSubscriptions : {[key:string]: Subscription} = {} // dictionary in case a user leaves a group chat. need to unsubscribe
  chatListSubscription: Subscription;
  chatListRxStomp: Subscription;
  activeChatSubscription: Subscription;
  uid: string;
  personalUserInfoSubscription:Subscription;

  // for mobile rendering 
  onMobile: boolean = window.innerWidth < 768
  showChatPage: boolean = false // initally render the chat list in the mobile view

  constructor(private chatlistService: ChatListService, private chatPageService: ChatPageService, private friendsService: FriendsService, private chatTabService: ChatTabService, 
    private personalUserInfoService: PersonalUserInfoService){
      this.personalUserInfoSubscription = this.personalUserInfoService.userInfo.subscribe(info  => this.uid = info.id)
  }
  
  // keeping these calls here because if I switched to mobile view and conditionally rendered chatlist, then these would always execute on init when it shouldn't
  ngOnInit(): void {

    // subscribe to active chat so you can show chat page in mobile view
    this.activeChatSubscription = this.chatTabService.activeChat.subscribe(currentChat =>{
      if(currentChat.chatId !== ""){
        this.showChatPage = true
      } 
      this.activeChat = currentChat
    })


    // need this for createChatSubscription (to update chat list properly when using chat publish subscribe websocket)
    // initializes chat list var here with the observable
    this.chatListSubscription = this.chatTabService.chatList.subscribe(newChatList => {
      this.chatList = newChatList
    })


    // this is for any new chats that are created from publish in backend (both single and gc)
    // this also considers if a gc has been updated (name, picture)
    this.chatListRxStomp = this.chatlistService.getChatlistSubscription(this.uid).subscribe(response => {
      const responseBody: ChatListResponse & {memberObjects: User[]} = JSON.parse(response.body)
      const newChat: ChatListResponse = {...responseBody}
      const usersToAdd: User[] = responseBody.memberObjects

      // in case friend adds you to a gc w/ non mutual friends. need to add users to userinfodict for proper rendering
      usersToAdd.forEach(user=>this.userInfoDict[user.id] = user)

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


    // get friends
    this.friendsService.getFriends().subscribe(friendList => {
      this.chatTabService.updateFriendList(friendList)
      friendList.forEach(friend => this.userInfoDict[friend.id] = friend) // update userinfo dict to have friends as well
    })

  }

  ngOnDestroy(): void {
    Object.values(this.chatSubscriptions).forEach(subscription => {
      subscription.unsubscribe()
    })

    this.chatListSubscription.unsubscribe()
    this.chatListRxStomp.unsubscribe()
    this.activeChatSubscription.unsubscribe()
    this.personalUserInfoSubscription.unsubscribe()
  }

  // this is strictly for any updates to chatlist thanks to updates of a chat: members joining/leaving, new messages coming in
  // chat page will have to handle members leaving and joining when in chat room tab
  createChatSubscription(chat: ChatListResponse) : void{
    // create observable for this component and chat page component first
    const chatPubSub = this.chatPageService.changeSubscription(chat.id)
    
    // whenever a message update comes from a chat, check if you need to update the CHATLIST element (moving it on top or updating recent message)
    const chatSub = chatPubSub.subscribe(message => {
      const messageObj: MessageResponse= JSON.parse(message.body)
      const index = this.chatList.findIndex((chat) => chat.id === messageObj.chatId)

      // this is related to anything that updates the group chat info. live updates on info doesnt return message id
      if(messageObj.id === ""){
        this.updateGcInfo(messageObj, index)
      }
      // any updates to message list: create, edit, delete
      else{
        this.updateMessageList(messageObj, index)
      }
    })

    this.chatSubscriptions[chat.id] = chatSub
  }


  updateGcInfo(messageObj: MessageResponse, index: number){
    if(messageObj.type === "leave"){
      // if the user themselves are leaving
      if(messageObj.sender === this.uid){
        this.chatSubscriptions[messageObj.chatId].unsubscribe() // this is to remove the subscription so we dont get new messages
        this.chatTabService.removeChat(messageObj.chatId) // this is to remove chat from chat list
      }
      else{
        const newMemberList = this.chatList[index].members.filter(id => id != messageObj.sender)
        this.chatList[index].members = newMemberList
        
        if(this.activeChat.chatId === messageObj.chatId){ //required in case user has the gc open. the modal wont reflect the user leaving without this
          this.chatTabService.updateActiveChat({...this.activeChat, members:newMemberList})
        }
      }
    }

    else if(messageObj.type === "add"){
      const usersToAdd: User[] = JSON.parse(messageObj.message) 
      
      usersToAdd.forEach(user => {
        this.chatList[index].members.push(user.id)
        this.userInfoDict[user.id] = user
      })

      this.chatTabService.updateChatList([...this.chatList])
      if(this.activeChat.chatId === messageObj.chatId){ //required in case user has the gc open. the modal wont reflect the user leaving without this
        this.chatTabService.updateActiveChat({...this.activeChat, members: this.chatList[index].members})
      }
    }

    else if(messageObj.type === "update name"){
      const updatedChat = this.chatList[index]
      updatedChat.chatName = messageObj.message
      
      const newChatList = [updatedChat, ...this.chatList.filter((chat) => chat.id != updatedChat.id)]
      this.chatTabService.updateChatList(newChatList)
      
      // this is primarily for other user. if the chat is displayed when another changes chat name, we need to force update the name
      // through the active chat since chat page uses that name property
      if(this.activeChat.chatId == updatedChat.id){
        this.chatTabService.updateActiveChat({...this.activeChat, chatName: messageObj.message})
      }
    }
  }

  updateMessageList(messageObj:MessageResponse, index: number){
    // if message was edited or deleted and was not the most recent, we dont care about updating chatlist
    if(messageObj.type !== "create" && messageObj.id !== this.chatList[index].latestMessage.messageId){
      return
    }

    const messageProperty = messageObj.type === "delete" ? "Message Deleted" : messageObj.message
    const senderIdProperty = messageObj.type === "create" ? messageObj.sender : this.chatList[index].latestMessage.uid
    this.chatList[index] = {...this.chatList[index], latestMessage:{uid: senderIdProperty, message: messageProperty, messageId: messageObj.id}, hidden:[]}

    // if someone edits or delete a message, we dont want the chat to appear at the top since not important
    if(messageObj.type === "create"){
      this.chatTabService.updateChatList([this.chatList[index], ...this.chatList.slice(0, index), ...this.chatList.slice(index+1)]) // slice handles out of bounds 
    }
    else{
      this.chatTabService.updateChatList([...this.chatList])
    }
  }
}
