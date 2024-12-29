import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnDestroy} from '@angular/core';
import { CommonModule} from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ChatListResponse, User } from '../../interfaces/interfaces';
import { UserListElement } from '../../user/user-list/user-list-element.component';
import { ChatTabService } from '../chat-tab/chat-tab.service';
import { Subscription } from 'rxjs';
import { ChatListService } from '../chat-list/chat-list.service';
import { PersonalUserInfoService } from '../../global-services/personalUserinfo.service';

@Component({
  selector: 'create-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, UserListElement],
  templateUrl: './create-chat.component.html'
})
export class CreateChat implements OnInit, OnDestroy{
  filteredFriendList: User[] = []; // when searching for friend with search bar
  selectedUsers: Set<string> = new Set();
  chatList: ChatListResponse[] = [];
  chatListSubscription: Subscription;
  friendList: User[] = [];
  friendListSubscription: Subscription;
  uid: string;
  personalUserInfoSubscription: Subscription;

  @Input() userInfoDict: { [id: string]: User } = {}
  @Output() closeCreateChat = new EventEmitter<void>();

  constructor(private chatTabService: ChatTabService, private chatListService: ChatListService, private personalUserInfoService: PersonalUserInfoService){}

  ngOnInit(): void {
    this.friendListSubscription = this.chatTabService.friendList.subscribe(newFriendList =>{
      this.friendList = newFriendList

      this.filteredFriendList = newFriendList
    })

    this.chatListSubscription = this.chatTabService.chatList.subscribe(newChatList => {
      this.chatList = newChatList
    })

    this.personalUserInfoSubscription = this.personalUserInfoService.userInfo.subscribe(info => this.uid = info.id)
  }

  ngOnDestroy(): void {
    this.friendListSubscription.unsubscribe()
    this.chatListSubscription.unsubscribe()
    this.personalUserInfoSubscription.unsubscribe()
  }

  endCreateChat(): void{
    this.closeCreateChat.emit();
  }

  createChat(): void{
    let chatExists = false
    const finalSelectedUsers = new Set([...this.selectedUsers, this.uid])

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
        if(chat?.hidden && chat.hidden.includes(this.uid)){
          this.chatTabService.unhideChat(chat.id)
        }
        this.chatTabService.updateActiveChat({chatId: chat.id, chatName: this.getChatName(chat), members: this.chatList[i].members})
        break
      }
    }

    if(!chatExists){
      const finalSelectedUsersArray: string[] = Array.from(finalSelectedUsers) //ids
      const finalSelectedUsersInfo: User[] = finalSelectedUsersArray.map(userId=> {return this.userInfoDict[userId]})

      this.chatTabService.updateActiveChat({chatId: "", chatName: "", members: [] as string[]})
      this.chatListService.createNewChat(finalSelectedUsersArray, finalSelectedUsersInfo)
    }

    this.closeCreateChat.emit();
  }
 
  filterFriendList(event:Event){
    const userSearch = (event.target as HTMLTextAreaElement)?.value.toLowerCase()
    this.filteredFriendList = this.friendList.filter(user => user.name.toLowerCase().startsWith(userSearch) || user.username.toLowerCase().startsWith(userSearch))
    return 
  }

  getChatName(chat: ChatListResponse): string{
    if(chat.chatName != ""){
      return chat.chatName as string
    }

    const selfUid = this.uid
    let chatName: string = ""

    // find the other user's name
    chat.members.forEach(userId => {
      if(userId != selfUid){
        chatName = this.userInfoDict[userId].name
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
