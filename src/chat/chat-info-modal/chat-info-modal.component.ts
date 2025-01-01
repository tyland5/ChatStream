import { Component, inject, OnDestroy, OnInit} from "@angular/core";
import { MatDialogActions, MatDialogContent, MatDialogTitle, MAT_DIALOG_DATA, MatDialogClose } from "@angular/material/dialog";
import { CommonModule } from "@angular/common";
import { UserListElement } from "../../user/user-list/user-list-element.component";
import { FormsModule } from "@angular/forms";
import { MatDialogRef } from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";
import { User } from "../../interfaces/interfaces";
import { FriendsService } from "../../user/friends/friends.service";
import { ChatListService } from "../chat-list/chat-list.service";
import { ChatInfoModalService } from "./chat-info-modal.service";

@Component({
    selector: 'chat-info-modal',
    standalone: true,
    imports: [CommonModule, UserListElement, FormsModule, MatDialogClose, MatIconModule],
    templateUrl: './chat-info-modal.component.html'
  })
  export class ChatInfoModal implements OnInit{
    data = inject(MAT_DIALOG_DATA);
    dialogRef = inject(MatDialogRef<ChatInfoModal>);
    chatName = this.data.chatName

    gcMembers: User[] = Object.hasOwn(this.data, "members") ? this.data.members as User[] : [] as User[]
    addingMembers:boolean = false;
    selectedUsers:Set<string> = new Set();
    friendList: User[] = [];

    constructor(private friendsService: FriendsService, private chatInfoModalService: ChatInfoModalService){}
    
    ngOnInit(): void {
      // if this is in dms, then fetch the friend list. need to add if statement.
      this.friendsService.getFriends().subscribe(friends => {
        const memberUidSet:Set<string> = new Set();
        this.gcMembers.forEach(member => {
          memberUidSet.add(member.id)
        });

        this.friendList = friends.filter(friend => !memberUidSet.has(friend.id)) // need to only have friends not in the chat already
      })
    }

    modifySelectedUsers(uid: string){
      if(this.selectedUsers.has(uid)){
        this.selectedUsers.delete(uid)
      }
      else if (this.selectedUsers.size < (10 - this.gcMembers.length)){ // prevents from adding to many members
        this.selectedUsers.add(uid)
      }
    }

    addMember(){
      const selectedUsersInfo: User[] = this.friendList.filter(user => this.selectedUsers.has(user.id))


      this.chatInfoModalService.addToGroupChat(this.data.chatId, this.chatName, selectedUsersInfo, this.gcMembers).subscribe(added=>{
        if(added){
          this.addingMembers = false
          this.selectedUsers = new Set();
          selectedUsersInfo.forEach(user=> this.gcMembers.push(user)) // so user can see in the modal that the users were add through the member list
        }
      })
    }
  }