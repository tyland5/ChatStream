import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnDestroy} from '@angular/core';
import { CommonModule} from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ChatListResponse, User } from '../../interfaces/interfaces';
import { UserListElement } from '../../user/user-list/user-list-element.component';
import { ChatTabService } from '../chat-tab/chat-tab.service';
import { Subscription } from 'rxjs';
import { ChatPageService } from '../chat-page/chat-page.service';
import { ChatListService } from '../chat-list/chat-list.service';

@Component({
  selector: 'create-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, UserListElement],
  templateUrl: './create-chat.component.html'
})
export class CreateChat implements OnInit, OnDestroy{
  filteredFriendList: User[] = [];
  selectedUsers: Set<string> = new Set();
  chatList: ChatListResponse[] = [];
  chatListSubscription: Subscription;
  friendList: User[] = [];
  friendMap: {[uid: string]: string} = {}
  friendListSubscription: Subscription;

  @Output() closeCreateChat = new EventEmitter<void>();

  constructor(private chatTabService: ChatTabService, private chatPageService: ChatPageService, private chatListService: ChatListService){}

  ngOnInit(): void {
    this.friendListSubscription = this.chatTabService.friendList.subscribe(newFriendList =>{
      this.friendList = newFriendList
      newFriendList.forEach(user=>{
        this.friendMap[user.id] = user.username
      })

      this.filteredFriendList = newFriendList
    })

    this.chatListSubscription = this.chatTabService.chatList.subscribe(newChatList => {
      this.chatList = newChatList
    })
  }

  ngOnDestroy(): void {
    this.friendListSubscription.unsubscribe()
    this.chatListSubscription.unsubscribe()
  }

  endCreateChat(): void{
    this.closeCreateChat.emit();
  }

  createChat(): void{
    let chatExists = false
    const finalSelectedUsers = new Set([...this.selectedUsers, localStorage.getItem("uid") as string])

    for(let i =0; i< this.chatList.length; i++){
      const chat = this.chatList[i]
      let correctChat = true

      if(chat.members.length !== finalSelectedUsers.size){
        continue
      }

      chat.members.forEach(member =>{
        if(!finalSelectedUsers.has(member)){
          correctChat = false
        }
      })

      if(correctChat){
        chatExists = true
        console.log("CHAT EXISTS")
        this.chatTabService.updateActiveChat({chatId: chat.id, chatName: this.getChatName(chat)})
        break
      }
    }

    if(!chatExists){
      this.chatTabService.updateActiveChat({chatId: "", chatName: this.selectedUsers.size === 1 ? this.friendMap[this.selectedUsers.values().next().value as string] : "New GC"})
      this.chatListService.createNewChat(Array.from(finalSelectedUsers))
      console.log("chat does not exist")
    }

    this.closeCreateChat.emit();
  }
 
  filterFriendList(event:Event){
    const userSearch = (event.target as HTMLTextAreaElement)?.value.toLowerCase()
    this.filteredFriendList = this.friendList.filter(user => user.name.toLowerCase().startsWith(userSearch) || user.username.toLowerCase().startsWith(userSearch))
    return 
  }

  getChatName(chat: ChatListResponse): string{
    if(chat.members.length > 2){
      return "GROUP CHAT PLACEHOLDER NAME"
    }

    const selfUid = localStorage.getItem("uid")
    let chatName: string = ""

    // find the other user's name
    chat.members.forEach(userId => {
      if(userId != selfUid){
        chatName = this.friendMap[userId]
      }
    });

    return chatName
  }

  modifySelectedUsers(uid: string){
    
    if(this.selectedUsers.has(uid)){
      this.selectedUsers.delete(uid)
    }
    else{
      this.selectedUsers.add(uid)
    }
  }
}
